<?php
declare(strict_types=1);

/**
 * The real services behind the handler: configuration, MySQL, Turnstile and SMTP (PHPMailer).
 * Nothing here runs until a valid submission needs it.
 */
final class TrackStarServices
{
    public const RATE_LIMIT_MAX = 5;
    public const RATE_LIMIT_WINDOW_SECONDS = 600;
    /** Spam-limit rows are kept this long (seconds); the Privacy Notice says up to 24 hours. */
    public const RATE_LIMIT_KEEP_SECONDS = 86400;
    /** Log lines are kept this many days; the Privacy Notice says up to 30 days. */
    public const LOG_KEEP_DAYS = 30;
    public const LOG_MAX_BYTES = 1_000_000;

    private ?array $config = null;
    private ?PDO $pdo = null;

    private string $logDir;

    public function __construct(string $logDir)
    {
        $this->logDir = $logDir;
    }

    /** @return array<string, mixed> */
    public function config(): array
    {
        if ($this->config === null) {
            // TRACKSTAR_CONFIG lets automated tests use a different file; hosting never sets it.
            $path = getenv('TRACKSTAR_CONFIG') ?: __DIR__ . '/../config.php';
            if (!is_file($path)) {
                throw new RuntimeException('api/config.php is missing');
            }
            $config = require $path;
            if (!is_array($config)) {
                throw new RuntimeException('api/config.php must return an array');
            }
            $this->config = $config;
        }
        return $this->config;
    }

    private function setting(string $key, string $default = ''): string
    {
        $value = $this->config()[$key] ?? $default;
        return is_scalar($value) ? trim((string) $value) : $default;
    }

    /** A setting that must have been filled in (not left as a CHANGE_ME placeholder). */
    private function required(string $key): string
    {
        $value = $this->setting($key);
        if ($value === '' || str_starts_with($value, 'CHANGE_ME')) {
            throw new RuntimeException("{$key} is not set in api/config.php");
        }
        return $value;
    }

    public function log(string $message, string $detail = ''): void
    {
        $line = gmdate('Y-m-d H:i:s') . ' UTC ' . $message . ($detail !== '' ? ': ' . $detail : '') . "\n";
        $file = $this->logDir . '/api.log';
        if (is_dir($this->logDir) || @mkdir($this->logDir, 0750, true)) {
            $this->pruneLogs();
            if (is_file($file) && filesize($file) > self::LOG_MAX_BYTES) {
                @rename($file, $file . '.1');
            }
            if (@file_put_contents($file, $line, FILE_APPEND | LOCK_EX) !== false) {
                return;
            }
        }
        error_log(rtrim($line));
    }

    /**
     * Drops log lines older than LOG_KEEP_DAYS from api.log and api.log.1. Called on every log write and on every
     * form submission. Only the first (oldest) line is read when nothing is due, so it is cheap.
     */
    public function pruneLogs(?int $now = null): void
    {
        $cutoff = ($now ?? time()) - self::LOG_KEEP_DAYS * 86400;
        foreach (['/api.log', '/api.log.1'] as $name) {
            $file = $this->logDir . $name;
            if (!is_file($file)) {
                continue;
            }
            if (filesize($file) === 0) {
                continue;
            }
            $handle = @fopen($file, 'r');
            if ($handle === false) {
                continue;
            }
            $first = (string) fgets($handle);
            fclose($handle);
            $firstTime = self::lineTime($first);
            if ($firstTime !== null && $firstTime >= $cutoff) {
                continue; // oldest line is still within the limit
            }
            $handle = @fopen($file, 'c+');
            if ($handle === false || !flock($handle, LOCK_EX)) {
                continue;
            }
            $kept = '';
            $keeping = false;
            while (($line = fgets($handle)) !== false) {
                $time = self::lineTime($line);
                if ($time !== null) {
                    $keeping = $time >= $cutoff;
                } // a line without a time continues the previous entry
                if ($keeping) {
                    $kept .= $line;
                }
            }
            ftruncate($handle, 0);
            rewind($handle);
            fwrite($handle, $kept);
            flock($handle, LOCK_UN);
            fclose($handle);
            if ($kept === '' && $name === '/api.log.1') {
                @unlink($file);
            }
        }
    }

    private static function lineTime(string $line): ?int
    {
        if (preg_match('/^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) UTC /', $line, $m) !== 1) {
            return null;
        }
        $time = strtotime($m[1] . ' UTC');
        return $time === false ? null : $time;
    }

    public function pdo(): PDO
    {
        if ($this->pdo === null) {
            $dsn = $this->setting('DB_DSN'); // advanced/testing override
            if ($dsn === '') {
                $port = $this->setting('DB_PORT');
                $dsn = sprintf('mysql:host=%s;%sdbname=%s;charset=utf8mb4', $this->setting('DB_HOST', 'localhost'), $port !== '' ? "port={$port};" : '', $this->setting('DB_NAME'));
            }
            $this->pdo = new PDO($dsn, $this->setting('DB_USER') ?: null, $this->setting('DB_PASS') ?: null, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);
        }
        return $this->pdo;
    }

    /** Client address as seen by this server. Forwarded headers are used only if the config says the host is behind a proxy. */
    private function clientIp(): string
    {
        $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        if (in_array(strtolower($this->setting('TRUST_PROXY_HEADERS')), ['1', 'true', 'yes'], true)) {
            $forwarded = trim(explode(',', (string) ($_SERVER['HTTP_X_FORWARDED_FOR'] ?? ''))[0]);
            if ($forwarded !== '' && filter_var($forwarded, FILTER_VALIDATE_IP)) {
                $ip = $forwarded;
            }
        }
        return (string) $ip;
    }

    /** Salted HMAC so raw IP addresses are never stored. */
    public function hashedIp(): string
    {
        $salt = $this->setting('IP_SALT');
        if ($salt === '' || str_starts_with($salt, 'CHANGE_ME')) {
            throw new RuntimeException('IP_SALT is not set in api/config.php');
        }
        return hash_hmac('sha256', $this->clientIp(), $salt);
    }

    /** Fixed window per hashed IP and form: 5 per 10 minutes. True when the request is allowed. */
    public function allowRequest(string $scope): bool
    {
        $pdo = $this->pdo();
        $key = $scope . ':' . $this->hashedIp();
        $windowStart = gmdate('Y-m-d H:i:s', intdiv(time(), self::RATE_LIMIT_WINDOW_SECONDS) * self::RATE_LIMIT_WINDOW_SECONDS);

        $update = $pdo->prepare('UPDATE rate_limits SET hits = hits + 1 WHERE limiter_key = ? AND window_start = ?');
        $update->execute([$key, $windowStart]);
        if ($update->rowCount() === 0) {
            try {
                $pdo->prepare('INSERT INTO rate_limits (limiter_key, window_start, hits) VALUES (?, ?, 1)')->execute([$key, $windowStart]);
            } catch (PDOException) {
                // Another request created the row first; count this one on it.
                $update->execute([$key, $windowStart]);
            }
        }
        $select = $pdo->prepare('SELECT hits FROM rate_limits WHERE limiter_key = ? AND window_start = ?');
        $select->execute([$key, $windowStart]);
        $hits = (int) $select->fetchColumn();

        // On every submission, so nothing older than 24 hours is ever left behind.
        $pdo->prepare('DELETE FROM rate_limits WHERE window_start < ?')->execute([gmdate('Y-m-d H:i:s', time() - self::RATE_LIMIT_KEEP_SECONDS)]);
        $this->pruneLogs();
        return $hits <= self::RATE_LIMIT_MAX;
    }

    public function turnstileEnabled(): bool
    {
        return $this->setting('TURNSTILE_SECRET') !== '';
    }

    public function verifyTurnstile(?string $token): bool
    {
        if ($token === null || $token === '' || strlen($token) > 4096) {
            return false;
        }
        $body = http_build_query(['secret' => $this->setting('TURNSTILE_SECRET'), 'response' => $token, 'remoteip' => $this->clientIp()]);
        $url = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
        $reply = false;
        if (function_exists('curl_init')) {
            $ch = curl_init($url);
            curl_setopt_array($ch, [CURLOPT_POST => true, CURLOPT_POSTFIELDS => $body, CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 6, CURLOPT_CONNECTTIMEOUT => 4]);
            $reply = curl_exec($ch);
            curl_close($ch);
        } else {
            $context = stream_context_create(['http' => ['method' => 'POST', 'header' => "Content-Type: application/x-www-form-urlencoded\r\n", 'content' => $body, 'timeout' => 6]]);
            $reply = @file_get_contents($url, false, $context);
        }
        $data = is_string($reply) ? json_decode($reply, true) : null;
        return is_array($data) && ($data['success'] ?? false) === true;
    }

    private static function uuid(): string
    {
        $b = random_bytes(16);
        $b[6] = chr((ord($b[6]) & 0x0f) | 0x40);
        $b[8] = chr((ord($b[8]) & 0x3f) | 0x80);
        return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($b), 4));
    }

    /** @param array<string, mixed> $record @return string the new record's id */
    public function store(string $scope, array $record, DateTimeImmutable $now): string
    {
        $table = $scope === 'operator' ? 'operator_enquiries' : 'contact_enquiries';
        $record = ['id' => self::uuid()] + $record + ['created_at' => $now->setTimezone(new DateTimeZone('UTC'))->format('Y-m-d H:i:s')];
        $columns = array_keys($record);
        $sql = sprintf('INSERT INTO %s (%s) VALUES (%s)', $table, implode(', ', $columns), implode(', ', array_fill(0, count($columns), '?')));
        $this->pdo()->prepare($sql)->execute(array_values($record));
        return (string) $record['id'];
    }

    /** @param array{subject: string, text: string, reply_to: string, reply_name: string} $message */
    public function sendMail(array $message): void
    {
        require_once __DIR__ . '/brand.php';
        require_once __DIR__ . '/../vendor/phpmailer/Exception.php';
        require_once __DIR__ . '/../vendor/phpmailer/PHPMailer.php';
        require_once __DIR__ . '/../vendor/phpmailer/SMTP.php';

        $mail = new PHPMailer\PHPMailer\PHPMailer(true);
        $mail->isSMTP();
        $mail->Host = $this->setting('SMTP_HOST');
        $mail->Port = (int) $this->setting('SMTP_PORT', '587');
        $user = $this->setting('SMTP_USER');
        $mail->SMTPAuth = $user !== '';
        $mail->Username = $user;
        $mail->Password = $this->setting('SMTP_PASS');
        $secure = strtolower($this->setting('SMTP_SECURE', 'tls'));
        $mail->SMTPSecure = $secure === 'ssl' ? PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_SMTPS : ($secure === 'tls' ? PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS : '');
        $mail->SMTPAutoTLS = $secure === 'tls';
        $mail->Timeout = 10;
        $mail->CharSet = 'UTF-8';
        $mail->isHTML(false);

        $from = $this->required('MAIL_FROM');
        $to = $this->required('MAIL_TO');
        $mail->setFrom($from, $this->setting('MAIL_FROM_NAME') ?: TrackStarBrand::name());
        $mail->addAddress($to);
        $mail->addReplyTo($message['reply_to'], $message['reply_name']);
        $mail->Subject = $message['subject'];
        $mail->Body = $message['text'];
        $mail->send();
    }
}
