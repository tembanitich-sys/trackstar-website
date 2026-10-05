<?php
/**
 * Copy this file to config.php (same folder), then replace every placeholder below.
 * config.php holds passwords: never upload it anywhere public and never commit it.
 * The web server is told (api/.htaccess) never to serve it.
 */
return [
    // MySQL database (Hepsia: Databases section)
    'DB_HOST' => 'localhost',
    'DB_PORT' => '',                              // leave empty unless your host gave you a port
    'DB_NAME' => 'CHANGE_ME_database_name',
    'DB_USER' => 'CHANGE_ME_database_user',
    'DB_PASS' => 'CHANGE_ME_database_password',

    // Outgoing mail (SMTP) through the mailbox noreply@trackstar.co.zw
    'SMTP_HOST' => 'CHANGE_ME_smtp_host',        // for example mail.trackstar.co.zw
    'SMTP_PORT' => 587,                           // 587 with 'tls', or 465 with 'ssl'
    'SMTP_SECURE' => 'tls',                       // 'tls', 'ssl' or '' (none)
    'SMTP_USER' => 'noreply@trackstar.co.zw',
    'SMTP_PASS' => 'CHANGE_ME_mailbox_password',

    // Both addresses live here, not in the code. MAIL_FROM must be the mailbox that SMTP_USER signs in to
    // (most hosts refuse anything else). MAIL_TO is where enquiries are delivered; while the domain's
    // mail is not set up yet, point it at an address you can already read.
    'MAIL_FROM' => 'noreply@trackstar.co.zw',
    'MAIL_FROM_NAME' => 'TrackStar',
    'MAIL_TO' => 'info@trackstar.co.zw',

    // Secret text used to scramble visitors' IP addresses for rate limiting. Any long random
    // string; make it up once and keep it. Changing it later only resets the counters.
    'IP_SALT' => 'CHANGE_ME_long_random_text',

    // Optional: Cloudflare Turnstile. Leave both empty to switch it off.
    // The secret goes here; the site key is baked into the website at build time.
    'TURNSTILE_SECRET' => '',

    // Set to true only if your host puts a proxy in front of PHP and you have been told so.
    'TRUST_PROXY_HEADERS' => false,
];
