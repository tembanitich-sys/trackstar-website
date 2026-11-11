<?php
declare(strict_types=1);

require_once __DIR__ . '/phone.php';

/**
 * Server-side validation for both forms. These are the same rules the site's TypeScript
 * schemas used (names, lengths, choices, e-mail shape, phone numbers), with the same messages.
 *
 * Each function returns ['ok' => bool, 'errors' => [field => message], 'data' => record].
 * Field names in `errors` match the form's field ids ("mobile", "phone", "email", ...).
 */
final class TrackStarValidate
{
    /** Same pattern Zod uses for z.email(). */
    private const EMAIL = '/^(?!\.)(?!.*\.\.)([A-Za-z0-9_\'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/D';

    /** @return array<string, array<string, string>> */
    private static function options(): array
    {
        static $options = null;
        return $options ??= require __DIR__ . '/options.php';
    }

    /** @param array<string, mixed> $in */
    private static function text(array $in, string $key): string
    {
        $value = $in[$key] ?? '';
        return is_string($value) ? trim($value) : '';
    }

    private static function tooLong(string $value, int $max): bool
    {
        return mb_strlen($value, 'UTF-8') > $max;
    }

    /**
     * @param array<string, string> $errors
     */
    private static function required(array &$errors, string $field, string $value, string $label, int $max): void
    {
        if ($value === '') {
            $errors[$field] = "Please enter your {$label}.";
        } elseif (self::tooLong($value, $max)) {
            $errors[$field] = "Please use {$max} characters or fewer.";
        }
    }

    /** @param array<string, string> $errors */
    private static function email(array &$errors, string $value): void
    {
        if (!preg_match(self::EMAIL, $value)) {
            $errors['email'] = 'Please enter a valid email address.';
        } elseif (strlen($value) > 254) {
            $errors['email'] = 'That email address is too long.';
        }
    }

    /** @param array<string, string> $errors */
    private static function choice(array &$errors, string $field, string $value, array $allowed, string $message): void
    {
        if (!array_key_exists($value, $allowed)) {
            $errors[$field] = $message;
        }
    }

    /** @param array<string, mixed> $in */
    private static function optionalShort(array $in, string $key): ?string
    {
        $value = mb_substr(self::text($in, $key), 0, 100, 'UTF-8');
        return $value === '' ? null : $value;
    }

    /**
     * @param array<string, mixed> $in
     * @return array{ok: bool, errors: array<string, string>, data: array<string, mixed>}
     */
    public static function operator(array $in, DateTimeImmutable $now): array
    {
        $o = self::options();
        $errors = [];

        $fullName = self::text($in, 'fullName');
        $company = self::text($in, 'company');
        $email = self::text($in, 'email');
        $country = self::text($in, 'country');
        $fleet = self::text($in, 'fleetSize');
        $help = self::text($in, 'helpType');
        $current = self::text($in, 'currentTicketing');
        $systemName = self::text($in, 'currentSystemName');
        $message = self::text($in, 'message');

        self::required($errors, 'fullName', $fullName, 'full name', 120);
        self::required($errors, 'company', $company, 'company name', 160);
        self::email($errors, $email);

        $countryRecord = TrackStarPhone::country($country);
        if ($countryRecord === null) {
            $errors['country'] = 'Please choose your country.';
        }
        self::choice($errors, 'fleetSize', $fleet, $o['fleet_sizes'], 'Please choose your fleet size.');
        self::choice($errors, 'helpType', $help, $o['help_types'], 'Please tell us how we can help.');
        self::choice($errors, 'currentTicketing', $current, $o['current_ticketing'], 'Please choose an option.');
        if (self::tooLong($systemName, 120)) {
            $errors['currentSystemName'] = 'Please use 120 characters or fewer.';
        }
        if (self::tooLong($message, 2000)) {
            $errors['message'] = 'Please keep your message under 2000 characters.';
        }
        if (($in['privacyAck'] ?? null) !== true) {
            $errors['privacyAck'] = 'Please confirm you have read the Privacy Notice.';
        }

        $phone = TrackStarPhone::toE164(self::text($in, 'mobileNational'), self::text($in, 'mobileCountry'));
        if ($phone === null) {
            $errors['mobile'] = 'Please enter a valid mobile number for the selected country.';
        }

        if ($errors) {
            return ['ok' => false, 'errors' => $errors, 'data' => []];
        }

        $marketing = ($in['marketingConsent'] ?? null) === true;
        return [
            'ok' => true,
            'errors' => [],
            'data' => [
                'full_name' => $fullName,
                'company' => $company,
                'phone_e164' => $phone,
                'email' => $email,
                'country' => (string) $countryRecord['name'],
                'fleet_size' => $fleet,
                'help_type' => $help,
                'current_ticketing' => $current,
                'current_system_name' => $current === 'own_system' && $systemName !== '' ? $systemName : null,
                'message' => $message !== '' ? $message : null,
                'marketing_consent' => $marketing ? 1 : 0,
                'marketing_consent_at' => $marketing ? $now->format('Y-m-d H:i:s') : null,
                'privacy_notice_version' => $o['privacy_notice_version'],
                'utm_source' => self::optionalShort($in, 'utmSource'),
                'utm_medium' => self::optionalShort($in, 'utmMedium'),
                'utm_campaign' => self::optionalShort($in, 'utmCampaign'),
            ],
        ];
    }

    /**
     * @param array<string, mixed> $in
     * @return array{ok: bool, errors: array<string, string>, data: array<string, mixed>}
     */
    public static function contact(array $in): array
    {
        $o = self::options();
        $errors = [];

        $name = self::text($in, 'name');
        $email = self::text($in, 'email');
        $type = self::text($in, 'enquiryType');
        $message = self::text($in, 'message');
        $phoneNational = self::text($in, 'phoneNational');

        self::required($errors, 'name', $name, 'name', 120);
        self::email($errors, $email);
        self::choice($errors, 'enquiryType', $type, $o['enquiry_types'], 'Please choose an enquiry type.');
        if ($message === '') {
            $errors['message'] = 'Please enter your message.';
        } elseif (self::tooLong($message, 3000)) {
            $errors['message'] = 'Please keep your message under 3000 characters.';
        }
        if (($in['privacyAck'] ?? null) !== true) {
            $errors['privacyAck'] = 'Please confirm you have read the Privacy Notice.';
        }

        // The phone is optional on the contact form, but must be valid when given.
        $phone = null;
        if ($phoneNational !== '') {
            $phone = TrackStarPhone::toE164($phoneNational, self::text($in, 'phoneCountry'));
            if ($phone === null) {
                $errors['phone'] = 'Please enter a valid phone number for the selected country.';
            }
        }

        if ($errors) {
            return ['ok' => false, 'errors' => $errors, 'data' => []];
        }
        return [
            'ok' => true,
            'errors' => [],
            'data' => [
                'name' => $name,
                'email' => $email,
                'phone_e164' => $phone,
                'enquiry_type' => $type,
                'message' => $message,
                'privacy_notice_version' => $o['privacy_notice_version'],
            ],
        ];
    }
}
