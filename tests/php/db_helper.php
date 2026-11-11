<?php
declare(strict_types=1);

// Test helper: prepares and inspects the database named in the config file given by TRACKSTAR_CONFIG.
//   php db_helper.php init            create empty tables (MySQL: runs db/schema.mysql.sql from scratch)
//   php db_helper.php rows <table>    print the table's rows as JSON
$config = require (string) getenv('TRACKSTAR_CONFIG');
$pdo = new PDO($config['DB_DSN'], $config['DB_USER'] ?? null, $config['DB_PASS'] ?? null, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]);
$isMysql = str_starts_with($config['DB_DSN'], 'mysql:');

if (($argv[1] ?? '') === 'init') {
    foreach (['operator_enquiries', 'contact_enquiries', 'rate_limits'] as $t) {
        $pdo->exec("DROP TABLE IF EXISTS $t");
    }
    if ($isMysql) {
        $sql = (string) preg_replace('/^\s*--.*$/m', '', (string) file_get_contents(__DIR__ . '/../../db/schema.mysql.sql'));
        foreach (array_filter(array_map('trim', explode(';', $sql))) as $statement) {
            $pdo->exec($statement);
        }
    } else {
        $pdo->exec('CREATE TABLE operator_enquiries (id TEXT PRIMARY KEY, full_name TEXT NOT NULL, company TEXT NOT NULL, phone_e164 TEXT NOT NULL, email TEXT NOT NULL, country TEXT NOT NULL, fleet_size TEXT NOT NULL, help_type TEXT NOT NULL, current_ticketing TEXT NOT NULL, current_system_name TEXT, message TEXT, marketing_consent INTEGER NOT NULL DEFAULT 0, marketing_consent_at TEXT, privacy_notice_version TEXT NOT NULL, utm_source TEXT, utm_medium TEXT, utm_campaign TEXT, created_at TEXT NOT NULL)');
        $pdo->exec('CREATE TABLE contact_enquiries (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL, phone_e164 TEXT, enquiry_type TEXT NOT NULL, message TEXT NOT NULL, privacy_notice_version TEXT NOT NULL, created_at TEXT NOT NULL)');
        $pdo->exec('CREATE TABLE rate_limits (limiter_key TEXT NOT NULL, window_start TEXT NOT NULL, hits INTEGER NOT NULL DEFAULT 1, PRIMARY KEY (limiter_key, window_start))');
    }
    echo 'ok';
} elseif (($argv[1] ?? '') === 'rows') {
    $table = $argv[2];
    if (!in_array($table, ['operator_enquiries', 'contact_enquiries', 'rate_limits'], true)) {
        exit(2);
    }
    $order = $table === 'rate_limits' ? 'window_start' : 'created_at';
    echo json_encode($pdo->query("SELECT * FROM $table ORDER BY $order")->fetchAll(), JSON_UNESCAPED_UNICODE);
}
