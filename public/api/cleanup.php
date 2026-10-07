<?php
declare(strict_types=1);

/**
 * Daily cleanup, run from the hosting panel's scheduled tasks (cron), never from the web:
 *   - spam-limit rows older than 24 hours are deleted from the database,
 *   - lines older than 30 days are removed from api/logs/api.log.
 * Safe to run as often as you like: it only removes what is already past its limit.
 * Quiet when it works (so the host does not e-mail you every day); prints a line only on a problem.
 * Add --verbose to see what it did.
 *
 * Not reachable from the web: api/.htaccess serves only enquiry.php and contact.php, and the check below
 * refuses anything that is not the command line.
 */
if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

require __DIR__ . '/lib/services.php';

$verbose = in_array('--verbose', $argv ?? [], true);
$services = new TrackStarServices(getenv('TRACKSTAR_LOG_DIR') ?: __DIR__ . '/logs'); // the variable is for automated tests only

try {
    $rows = $services->pruneRateLimits();
    $lines = $services->pruneLogs();
    if ($verbose) {
        echo "Cleanup done: {$rows} spam-limit row(s) and {$lines} log line(s) removed.\n";
    }
    exit(0);
} catch (Throwable $e) {
    $services->log('cleanup failed', $e->getMessage());
    fwrite(STDERR, 'Cleanup failed: ' . $e->getMessage() . "\n");
    exit(1);
}
