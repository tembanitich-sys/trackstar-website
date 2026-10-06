<?php
declare(strict_types=1);

/**
 * The choices offered on the forms (value => label). Keep in step with content/site.ts;
 * tests/php.test.ts fails if they drift apart.
 */
return [
    'fleet_sizes' => [
        '1-5' => '1 to 5 buses',
        '6-15' => '6 to 15',
        '16-40' => '16 to 40',
        '40+' => 'More than 40',
    ],
    'help_types' => [
        'need_system' => 'I need a ticketing system',
        'replace_system' => 'I want to replace my current system',
        'demo' => 'I would like a demo',
        'connect_instatickets' => 'I want to connect my system to InstaTickets',
        'other' => 'Other',
    ],
    'current_ticketing' => [
        'none' => 'None or manual',
        'own_system' => 'Our own system',
        'not_sure' => 'Not sure',
    ],
    'enquiry_types' => [
        'general' => 'General',
        'sales' => 'Sales',
        'demo' => 'Demo',
        'integration' => 'Integration',
        'technical' => 'Technical',
        'other' => 'Other',
    ],
    'privacy_notice_version' => '2026-10-busrep',
];
