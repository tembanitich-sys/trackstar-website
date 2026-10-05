<?php
declare(strict_types=1);

// Pipeline tests with fake services (no database, no network). Run by tests/php.test.ts.
require __DIR__ . '/../../public/api/lib/handler.php';

$failures = [];
function check(string $name, bool $ok, string $detail = ''): void
{
    global $failures;
    echo ($ok ? 'PASS ' : 'FAIL ') . $name . ($ok || $detail === '' ? '' : " ($detail)") . "\n";
    if (!$ok) {
        $failures[] = $name;
    }
}

function operatorInput(array $over = []): array
{
    return $over + [
        'fullName' => 'Test Person', 'company' => 'Test Coaches', 'mobileCountry' => 'ZW', 'mobileNational' => '077 123 4567',
        'email' => 'test@example.com', 'country' => 'ZW', 'fleetSize' => '6-15', 'helpType' => 'need_system',
        'currentTicketing' => 'none', 'currentSystemName' => '', 'message' => '', 'privacyAck' => true, 'marketingConsent' => false,
        'website' => '',
    ];
}

function contactInput(array $over = []): array
{
    return $over + ['name' => 'Test Person', 'email' => 'test@example.com', 'phoneCountry' => 'ZW', 'phoneNational' => '', 'enquiryType' => 'general', 'message' => 'Hello', 'privacyAck' => true, 'website' => ''];
}

/** @return array{deps: array<string, callable>, calls: ArrayObject} */
function fakes(array $over = []): array
{
    $calls = new ArrayObject();
    $deps = $over + [
        'now' => fn () => new DateTimeImmutable('2026-10-05 08:00:00', new DateTimeZone('UTC')),
        'rate_limit' => function ($scope) use ($calls) { $calls[] = 'rate_limit'; return true; },
        'turnstile_enabled' => fn () => false,
        'verify_turnstile' => function ($t) use ($calls) { $calls[] = 'turnstile'; return true; },
        'store' => function ($scope, $record, $now) use ($calls) { $calls[] = 'store'; $calls['record'] = $record; return 'id-1'; },
        'send_mail' => function ($m) use ($calls) { $calls[] = 'mail'; $calls['mail'] = $m; },
        'log' => function ($m, $d = '') use ($calls) { $calls['log'] = [$m, $d]; },
    ];
    return ['deps' => $deps, 'calls' => $calls];
}

function steps(ArrayObject $calls): string
{
    return implode(',', array_filter((array) $calls->getArrayCopy(), 'is_int', ARRAY_FILTER_USE_KEY));
}

// --- success path and ordering
$f = fakes();
[$status, $body] = TrackStarHandler::handle('operator', operatorInput(), $f['deps']);
check('valid enquiry succeeds', $status === 200 && $body === ['ok' => true]);
check('order: rate limit, store, then mail', steps($f['calls']) === 'rate_limit,store,mail', steps($f['calls']));
check('phone stored as E.164', $f['calls']['record']['phone_e164'] === '+263771234567');
check('country stored by name', $f['calls']['record']['country'] === 'Zimbabwe');
check('consent defaults to 0 / null', $f['calls']['record']['marketing_consent'] === 0 && $f['calls']['record']['marketing_consent_at'] === null);
check('privacy notice version stored', $f['calls']['record']['privacy_notice_version'] === '2026-10-trackstar');
check('mail carries reply-to and reference', $f['calls']['mail']['reply_to'] === 'test@example.com' && str_contains($f['calls']['mail']['text'], 'Reference: id-1'));

$f = fakes();
TrackStarHandler::handle('operator', operatorInput(['marketingConsent' => true]), $f['deps']);
check('ticked marketing box records UTC timestamp', $f['calls']['record']['marketing_consent'] === 1 && $f['calls']['record']['marketing_consent_at'] === '2026-10-05 08:00:00');

$f = fakes();
TrackStarHandler::handle('operator', operatorInput(['marketingConsent' => 'on']), $f['deps']);
check('only a real boolean true counts as consent', $f['calls']['record']['marketing_consent'] === 0);

$f = fakes();
TrackStarHandler::handle('operator', operatorInput(['currentTicketing' => 'own_system', 'currentSystemName' => 'Acme']), $f['deps']);
check('system name kept for own_system', $f['calls']['record']['current_system_name'] === 'Acme');
$f = fakes();
TrackStarHandler::handle('operator', operatorInput(['currentTicketing' => 'none', 'currentSystemName' => 'Acme']), $f['deps']);
check('system name dropped otherwise', $f['calls']['record']['current_system_name'] === null);

// --- email failure
$f = fakes(['send_mail' => function () { throw new RuntimeException('smtp down'); }]);
[$status, $body] = TrackStarHandler::handle('operator', operatorInput(), $f['deps']);
check('email failure still returns success', $status === 200 && $body['ok'] === true);
check('email failure is logged', ($f['calls']['log'][0] ?? '') !== '' && str_contains($f['calls']['log'][0], 'email failed') && $f['calls']['log'][1] === 'smtp down');
check('record was stored before the email failed', str_contains(steps($f['calls']), 'store'));

// --- database failure
$f = fakes(['store' => function () { throw new RuntimeException('db down'); }]);
[$status, $body] = TrackStarHandler::handle('operator', operatorInput(), $f['deps']);
check('database failure is an error and sends no email', $status === 500 && $body['ok'] === false && !str_contains(steps($f['calls']), 'mail'));

// --- validation
$f = fakes();
[$status, $body] = TrackStarHandler::handle('operator', operatorInput(['mobileNational' => '12', 'email' => 'nope', 'company' => '', 'privacyAck' => false]), $f['deps']);
check('invalid input gives 422 with field errors', $status === 422 && isset($body['fieldErrors']['mobile'], $body['fieldErrors']['email'], $body['fieldErrors']['company'], $body['fieldErrors']['privacyAck']));
check('validation runs before rate limit, Turnstile and storage', steps($f['calls']) === '');
check('phone message', $body['fieldErrors']['mobile'] === 'Please enter a valid mobile number for the selected country.');

foreach ([
    ['fullName', str_repeat('a', 121)], ['company', str_repeat('a', 161)], ['message', str_repeat('a', 2001)],
    ['fleetSize', '99'], ['helpType', 'x'], ['currentTicketing', 'x'], ['country', 'XX'], ['email', 'a@b'], ['email', 'a..b@example.com'], ['email', '.a@example.com'],
] as [$field, $value]) {
    [$s, $b] = TrackStarHandler::handle('operator', operatorInput([$field => $value]), fakes()['deps']);
    check("rejects bad $field", $s === 422 && isset($b['fieldErrors'][$field]), json_encode($b['fieldErrors'] ?? null));
}
foreach (['a@example.com', 'first.last+tag@sub.example.co.zw', "o'brien@example.org"] as $email) {
    [$s] = TrackStarHandler::handle('operator', operatorInput(['email' => $email]), fakes()['deps']);
    check("accepts email $email", $s === 200);
}
[$s, $b] = TrackStarHandler::handle('operator', operatorInput(['fullName' => ['array'], 'company' => 5]), fakes()['deps']);
check('non-string values are treated as empty', $s === 422 && isset($b['fieldErrors']['fullName'], $b['fieldErrors']['company']));
[$s] = TrackStarHandler::handle('operator', operatorInput(['mobileCountry' => 'ZA', 'mobileNational' => '082 123 4567']), fakes()['deps']);
check('other countries work', $s === 200);

// --- rate limit and Turnstile
$f = fakes(['rate_limit' => fn () => false]);
[$status] = TrackStarHandler::handle('operator', operatorInput(), $f['deps']);
check('rate limit gives 429 and stores nothing', $status === 429 && !str_contains(steps($f['calls']), 'store'));

$f = fakes(['turnstile_enabled' => fn () => true, 'verify_turnstile' => fn ($t) => false]);
[$status] = TrackStarHandler::handle('operator', operatorInput(['turnstileToken' => 'x']), $f['deps']);
check('Turnstile on and failing gives 400 and stores nothing', $status === 400 && !str_contains(steps($f['calls']), 'store'));

$f = fakes(['turnstile_enabled' => fn () => true, 'verify_turnstile' => fn ($t) => $t === 'good']);
[$s1] = TrackStarHandler::handle('operator', operatorInput(['turnstileToken' => 'good']), $f['deps']);
[$s2] = TrackStarHandler::handle('operator', operatorInput(), $f['deps']);
check('Turnstile on: good token passes, missing token fails', $s1 === 200 && $s2 === 400);

$f = fakes(['verify_turnstile' => function () { throw new RuntimeException('must not be called'); }]);
[$status] = TrackStarHandler::handle('operator', operatorInput(), $f['deps']);
check('Turnstile off: never consulted', $status === 200);

// --- honeypot
$f = fakes();
[$status, $body] = TrackStarHandler::handle('operator', operatorInput(['website' => 'http://spam.example']), $f['deps']);
check('honeypot looks like success but does nothing', $status === 200 && $body === ['ok' => true] && steps($f['calls']) === '');

// --- contact
$f = fakes();
[$status] = TrackStarHandler::handle('contact', contactInput(), $f['deps']);
check('contact succeeds without a phone', $status === 200 && $f['calls']['record']['phone_e164'] === null && steps($f['calls']) === 'rate_limit,store,mail');
$f = fakes();
TrackStarHandler::handle('contact', contactInput(['phoneNational' => '0771234567']), $f['deps']);
check('contact phone is normalised', $f['calls']['record']['phone_e164'] === '+263771234567');
[$s, $b] = TrackStarHandler::handle('contact', contactInput(['phoneNational' => '12', 'message' => '', 'enquiryType' => 'zzz']), fakes()['deps']);
check('contact validation', $s === 422 && isset($b['fieldErrors']['phone'], $b['fieldErrors']['message'], $b['fieldErrors']['enquiryType']));
$f = fakes(['send_mail' => function () { throw new RuntimeException('smtp down'); }]);
[$status] = TrackStarHandler::handle('contact', contactInput(), $f['deps']);
check('contact email failure still succeeds', $status === 200);

// --- e-mail content
$f = fakes();
TrackStarHandler::handle('operator', operatorInput(['company' => "Evil\r\nBcc: x@y.z", 'fullName' => "Name\nInjected: 1"]), $f['deps']);
check('no line breaks in subject or reply-to name', !preg_match('/[\r\n]/', $f['calls']['mail']['subject'] . $f['calls']['mail']['reply_name']));

echo "\n" . (count($failures) ? count($failures) . ' failed' : 'all passed') . "\n";
exit(count($failures) ? 1 : 0);
