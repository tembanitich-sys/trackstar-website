<?php
declare(strict_types=1);

// Retention checks for the real services class: spam-limit rows and the error log. Run by tests/php.test.ts.
require __DIR__ . '/../../public/api/lib/services.php';

$failures = [];
function check(string $name, bool $ok, string $detail = ''): void
{
    global $failures;
    echo ($ok ? 'PASS ' : 'FAIL ') . $name . ($ok || $detail === '' ? '' : " ($detail)") . "\n";
    if (!$ok) {
        $failures[] = $name;
    }
}

$tmp = sys_get_temp_dir() . '/ts-services-' . bin2hex(random_bytes(4));
mkdir($tmp . '/logs', 0777, true);
$config = $tmp . '/config.php';
file_put_contents($config, '<?php return ' . var_export(['DB_DSN' => 'sqlite:' . $tmp . '/t.sqlite', 'IP_SALT' => 'salt'], true) . ';');
putenv('TRACKSTAR_CONFIG=' . $config);

$services = new TrackStarServices($tmp . '/logs');
$pdo = $services->pdo();
$pdo->exec('CREATE TABLE rate_limits (limiter_key TEXT NOT NULL, window_start TEXT NOT NULL, hits INTEGER NOT NULL DEFAULT 1, PRIMARY KEY (limiter_key, window_start))');

// Spam-limit rows: anything older than 24 hours goes on EVERY submission (not one in fifty).
$old = gmdate('Y-m-d H:i:s', time() - 86400 - 600);
$recent = gmdate('Y-m-d H:i:s', time() - 3600);
$all = true;
for ($i = 0; $i < 20; $i++) {
    $pdo->prepare('INSERT INTO rate_limits (limiter_key, window_start, hits) VALUES (?, ?, 1)')->execute(["old:$i", $old]);
    $pdo->prepare('INSERT INTO rate_limits (limiter_key, window_start, hits) VALUES (?, ?, 1)')->execute(["recent:$i", $recent]);
    $services->allowRequest('enquiry');
    $left = (int) $pdo->query("SELECT COUNT(*) FROM rate_limits WHERE limiter_key LIKE 'old:%'")->fetchColumn();
    if ($left !== 0) {
        $all = false;
    }
}
check('old spam-limit rows are deleted on every submission', $all);
check('recent spam-limit rows are kept', (int) $pdo->query("SELECT COUNT(*) FROM rate_limits WHERE limiter_key LIKE 'recent:%'")->fetchColumn() === 20);

// Error log: lines older than 30 days go; recent ones stay; a multi-line entry follows its first line.
$stamp = fn (int $daysAgo, int $extra = 0): string => gmdate('Y-m-d H:i:s', time() - $daysAgo * 86400 - $extra) . ' UTC';
$logFile = $tmp . '/logs/api.log';
file_put_contents($logFile,
    $stamp(31) . " email failed: old one to a@example.com\n  continuation of the old entry\n"
    . $stamp(29, 3600) . " email failed: still kept\n  its continuation\n"
    . $stamp(1) . " email failed: yesterday\n");
file_put_contents($logFile . '.1', $stamp(40) . " email failed: ancient\n");

$services->allowRequest('enquiry'); // a submission prunes
$text = (string) file_get_contents($logFile);
check('log lines older than 30 days are removed on a submission', !str_contains($text, 'old one') && !str_contains($text, 'continuation of the old'));
check('log lines within 30 days stay, with their continuation', str_contains($text, 'still kept') && str_contains($text, 'its continuation') && str_contains($text, 'yesterday'));
check('a rotated log with only old lines is deleted', !is_file($logFile . '.1'));

// Writing a log line prunes too.
file_put_contents($logFile, $stamp(45) . " email failed: forty five days\n" . $stamp(2) . " email failed: two days\n");
$services->log('email failed', 'new');
$text = (string) file_get_contents($logFile);
check('writing a log line also prunes old lines', !str_contains($text, 'forty five') && str_contains($text, 'two days') && str_contains($text, 'email failed: new'));

// The size limit still rotates.
file_put_contents($logFile, str_repeat($stamp(0) . ' ' . str_repeat('x', 990) . "\n", 1100));
$services->log('after rotation');
check('the 1 MB size limit still rotates the log', is_file($logFile . '.1') && substr_count((string) file_get_contents($logFile), "\n") === 1);

// An empty or missing log is fine.
file_put_contents($logFile, '');
$services->pruneLogs();
unlink($logFile);
$services->pruneLogs();
check('empty or missing logs are fine', true);

echo $failures === [] ? "all passed\n" : '';
exit($failures === [] ? 0 : 1);
