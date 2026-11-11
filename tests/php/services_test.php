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

// The daily script (api/cleanup.php), run the way the hosting panel runs it: from the command line.
$script = __DIR__ . '/../../public/api/cleanup.php';
$runScript = function (array $args = [], ?string $configFile = null, ?string $logDir = null) use ($script, $config, $tmp): array {
    $cmd = escapeshellarg(PHP_BINARY) . ' ' . escapeshellarg($script) . ' ' . implode(' ', array_map('escapeshellarg', $args));
    $proc = proc_open($cmd, [1 => ['pipe', 'w'], 2 => ['pipe', 'w']], $pipes, null, array_merge(getenv(), ['TRACKSTAR_CONFIG' => $configFile ?? $config, 'TRACKSTAR_LOG_DIR' => $logDir ?? $tmp . '/logs']));
    $out = stream_get_contents($pipes[1]);
    $err = stream_get_contents($pipes[2]);
    return [$out, $err, proc_close($proc)];
};
$pdo->exec('DELETE FROM rate_limits');
$pdo->prepare('INSERT INTO rate_limits (limiter_key, window_start, hits) VALUES (?, ?, 1)')->execute(['old:a', $old]);
$pdo->prepare('INSERT INTO rate_limits (limiter_key, window_start, hits) VALUES (?, ?, 1)')->execute(['old:b', $old]);
$pdo->prepare('INSERT INTO rate_limits (limiter_key, window_start, hits) VALUES (?, ?, 1)')->execute(['recent:a', $recent]);
file_put_contents($logFile, $stamp(60) . " email failed: sixty days\n" . $stamp(3) . " email failed: three days\n");
[$out, $err, $code] = $runScript();
check('cleanup script: succeeds and is quiet when all is well', $code === 0 && $out === '' && $err === '', "$code|$out|$err");
check('cleanup script: removes old spam-limit rows, keeps recent ones', (int) $pdo->query('SELECT COUNT(*) FROM rate_limits')->fetchColumn() === 1 && (int) $pdo->query("SELECT COUNT(*) FROM rate_limits WHERE limiter_key = 'recent:a'")->fetchColumn() === 1);
$text = (string) file_get_contents($logFile);
check('cleanup script: removes old log lines, keeps recent ones', !str_contains($text, 'sixty days') && str_contains($text, 'three days'));
[$out, $err, $code] = $runScript(['--verbose']);
check('cleanup script: safe to repeat, and --verbose says what it did', $code === 0 && str_contains($out, '0 spam-limit row(s) and 0 log line(s)'), $out);
check('cleanup script: repeating changed nothing', str_contains((string) file_get_contents($logFile), 'three days') && (int) $pdo->query('SELECT COUNT(*) FROM rate_limits')->fetchColumn() === 1);
$pdo->prepare('INSERT INTO rate_limits (limiter_key, window_start, hits) VALUES (?, ?, 1)')->execute(['old:c', $old]);
file_put_contents($logFile, $stamp(40) . " email failed: forty days\n");
[$out] = $runScript(['--verbose']);
check('cleanup script: --verbose counts what it removed', str_contains($out, '1 spam-limit row(s) and 1 log line(s) removed'), $out);
[$out, $err, $code] = $runScript([], $tmp . '/missing-config.php');
check('cleanup script: a problem gives a non-zero exit, a message and a log line', $code === 1 && str_contains($err, 'Cleanup failed') && str_contains((string) file_get_contents($logFile), 'cleanup failed'), "$code|$err");

echo $failures === [] ? "all passed\n" : '';
exit($failures === [] ? 0 : 1);
