<?php
declare(strict_types=1);

require_once __DIR__ . '/validate.php';
require_once __DIR__ . '/brand.php';

/**
 * The steps every submission goes through, in order. All outside services are passed in as
 * callables so the same code runs in production (MySQL, SMTP, Turnstile) and in tests (fakes).
 *
 *   1. honeypot filled        -> pretend it worked, do nothing
 *   2. validation fails       -> 422 with a message per field
 *   3. rate limit exceeded    -> 429
 *   4. Turnstile (only if on) -> 400 when it does not verify
 *   5. save to the database   -> 500 if it fails (nothing is emailed)
 *   6. e-mail the team        -> a failure is logged and the visitor still sees success
 *
 * $deps keys: rate_limit(scope): bool (true = allowed), turnstile_enabled(): bool,
 * verify_turnstile(?token): bool, store(scope, record, now): string id,
 * send_mail(message): void, log(message, detail): void, now(): DateTimeImmutable.
 */
final class TrackStarHandler
{
    /** The website adds the public contact address when it shows this. */
    public const GENERIC_ERROR = 'Sorry, something went wrong and your request was not sent. Please try again.';

    /**
     * @param array<string, mixed> $input decoded JSON body
     * @param array<string, callable> $deps
     * @return array{0: int, 1: array<string, mixed>} HTTP status and JSON body
     */
    public static function handle(string $scope, array $input, array $deps): array
    {
        // 1. Honeypot: a real visitor never fills this field.
        if (is_string($input['website'] ?? null) && trim($input['website']) !== '') {
            return [200, ['ok' => true]];
        }

        $now = $deps['now']();
        $result = $scope === 'operator'
            ? TrackStarValidate::operator($input, $now)
            : TrackStarValidate::contact($input);
        if (!$result['ok']) {
            return [422, [
                'ok' => false,
                'message' => 'Please check the highlighted fields.',
                'fieldErrors' => $result['errors'],
            ]];
        }

        try {
            if (!$deps['rate_limit']($scope)) {
                return [429, ['ok' => false, 'message' => 'Too many requests. Please wait a few minutes and try again.']];
            }

            if ($deps['turnstile_enabled']()) {
                $token = is_string($input['turnstileToken'] ?? null) ? $input['turnstileToken'] : null;
                if (!$deps['verify_turnstile']($token)) {
                    return [400, ['ok' => false, 'message' => 'We could not confirm you are human. Please try again.']];
                }
            }

            // Save first: the enquiry must never depend on e-mail delivery.
            try {
                $id = $deps['store']($scope, $result['data'], $now);
            } catch (Throwable $e) {
                $deps['log']("{$scope} enquiry: database insert failed", $e->getMessage());
                return [500, ['ok' => false, 'message' => self::GENERIC_ERROR]];
            }

            try {
                $deps['send_mail'](TrackStarMessages::build($scope, $result['data'], $id));
            } catch (Throwable $e) {
                $deps['log']("{$scope} enquiry {$id}: email failed", $e->getMessage());
            }
        } catch (Throwable $e) {
            $deps['log']("{$scope} enquiry: unexpected failure", $e->getMessage());
            return [500, ['ok' => false, 'message' => self::GENERIC_ERROR]];
        }

        return [200, ['ok' => true]];
    }
}

/** Builds the notification e-mail sent to the team. */
final class TrackStarMessages
{
    /** @param array<string, mixed> $r @return array{subject: string, text: string, reply_to: string, reply_name: string} */
    public static function build(string $scope, array $r, string $id): array
    {
        $o = require __DIR__ . '/options.php';
        $label = static fn (string $list, string $value): string => $o[$list][$value] ?? $value;
        $oneLine = static fn (string $s): string => trim((string) preg_replace('/[\r\n]+/', ' ', $s));
        $brand = TrackStarBrand::name();

        if ($scope === 'operator') {
            $system = $r['current_system_name'] !== null ? " ({$r['current_system_name']})" : '';
            $source = implode(' / ', array_filter([$r['utm_source'], $r['utm_medium'], $r['utm_campaign']]));
            $lines = [
                "Full name: {$r['full_name']}",
                "Company: {$r['company']}",
                "Mobile: {$r['phone_e164']}",
                "Email: {$r['email']}",
                "Country: {$r['country']}",
                'Fleet size: ' . $label('fleet_sizes', $r['fleet_size']),
                'How can ' . $brand . ' help: ' . $label('help_types', $r['help_type']),
                'Current ticketing: ' . $label('current_ticketing', $r['current_ticketing']) . $system,
                'Marketing emails: ' . ($r['marketing_consent'] ? 'yes' : 'no'),
                'Source: ' . ($source !== '' ? $source : 'none recorded'),
                "Reference: {$id}",
                '',
                'Message:',
                $r['message'] ?? '(none)',
            ];
            return [
                'subject' => $oneLine("{$brand} enquiry: {$r['company']} (" . $label('help_types', $r['help_type']) . ')'),
                'text' => implode("\n", $lines),
                'reply_to' => (string) $r['email'],
                'reply_name' => $oneLine((string) $r['full_name']),
            ];
        }

        $lines = [
            "Name: {$r['name']}",
            "Email: {$r['email']}",
            'Phone: ' . ($r['phone_e164'] ?? 'not given'),
            'Enquiry type: ' . $label('enquiry_types', $r['enquiry_type']),
            "Reference: {$id}",
            '',
            'Message:',
            (string) $r['message'],
        ];
        return [
            'subject' => $oneLine("{$brand} contact: " . $label('enquiry_types', $r['enquiry_type']) . " from {$r['name']}"),
            'text' => implode("\n", $lines),
            'reply_to' => (string) $r['email'],
            'reply_name' => $oneLine((string) $r['name']),
        ];
    }
}
