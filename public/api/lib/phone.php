<?php
declare(strict_types=1);

/**
 * Phone number check and E.164 normalisation.
 *
 * A port of the parts of libphonenumber-js (minimal metadata) that the site used before,
 * driven by phone_data.php, which is generated from the same metadata. Given a number as typed
 * and a country, toE164() returns "+263771234567" style output, or null when the number is not valid.
 *
 * It is checked against libphonenumber-js on ~10,000 generated inputs (tests/phone-parity.test.ts).
 * Extensions are recognised in their common English forms.
 */
final class TrackStarPhone
{
    private const MIN_LENGTH_FOR_NSN = 2;
    private const MAX_LENGTH_FOR_NSN = 17;
    private const MAX_INPUT_LENGTH = 250;
    private const MAX_LENGTH_COUNTRY_CODE = 3;

    /** @var array{calling_codes: array<int|string, list<string>>, countries: array<string, array<string, mixed>>}|null */
    private static ?array $data = null;

    /** @return array{calling_codes: array<int|string, list<string>>, countries: array<string, array<string, mixed>>} */
    private static function data(): array
    {
        return self::$data ??= require __DIR__ . '/phone_data.php';
    }

    /** @return array<string, mixed>|null */
    public static function country(string $code): ?array
    {
        return self::data()['countries'][$code] ?? null;
    }

    /** @return array<string, string> ISO code => country name */
    public static function countryNames(): array
    {
        $names = [];
        foreach (self::data()['countries'] as $code => $c) {
            $names[$code] = (string) $c['name'];
        }
        return $names;
    }

    public static function toE164(string $input, string $country): ?string
    {
        $country = strtoupper($country);
        $default = self::country($country);
        if ($default === null) {
            return null;
        }

        $number = self::extractNumber(self::asciiDigits($input));
        if ($number === null) {
            return null;
        }

        // 1. Calling code: from "+", from an international dialling prefix, or from the number itself.
        [$cc, $rest] = self::extractCountryCallingCode(self::keepDigits($number), $country, $default);
        $plan = null;
        $selected = null;
        if ($cc !== null) {
            $selected = self::mainCountryFor($cc);
            $plan = $selected === null ? null : self::country($selected);
            if ($plan === null) {
                return null;
            }
            $country = null;
        } elseif ($rest !== null && $rest !== '') {
            $plan = $default;
            $cc = (string) $default['cc'];
        } else {
            return null;
        }
        if ($rest === null || $rest === '') {
            return null;
        }

        // 2. National number: strip a national prefix if that leaves a plausible number.
        $nn = self::extractNationalNumber(self::keepDigits($rest), null, $plan);

        // 3. Exact country within a shared calling code (for example +1).
        $exact = self::countryByCallingCode($cc, $nn);
        $finalCountry = $exact ?? $country;

        $length = strlen($nn);
        if ($length < self::MIN_LENGTH_FOR_NSN || $length > self::MAX_LENGTH_FOR_NSN) {
            return null;
        }

        // 4. Validity: the general pattern, and for countries that carry type patterns, one of those too.
        $validationPlan = $finalCountry !== null ? self::country($finalCountry) : self::country(self::mainCountryFor($cc) ?? '');
        if ($validationPlan === null || !self::isValidNational($nn, $validationPlan)) {
            return null;
        }
        return '+' . $cc . $nn;
    }

    /** Converts full-width and Arabic-Indic digits to ASCII, as libphonenumber does. */
    private static function asciiDigits(string $text): string
    {
        static $map = null;
        if ($map === null) {
            $map = [];
            foreach ([0xFF10, 0x0660, 0x06F0] as $zero) {
                for ($d = 0; $d <= 9; $d++) {
                    $map[mb_chr($zero + $d, 'UTF-8')] = (string) $d;
                }
            }
        }
        return strtr($text, $map);
    }

    /** Picks the number out of the typed text and drops any extension. Null when it is not a viable number. */
    private static function extractNumber(string $input): ?string
    {
        if (strlen($input) > self::MAX_INPUT_LENGTH) {
            return null;
        }
        if (!preg_match('/[+0-9]/', $input, $m, PREG_OFFSET_CAPTURE)) {
            return null;
        }
        $text = substr($input, (int) $m[0][1]);
        $text = (string) preg_replace('/[^0-9#]+$/', '', $text);

        $punct = '\-\x{2010}-\x{2015}\x{2212}\x{30FC}\x{FF0D}\/\x{FF0F}\.\x{FF0E} \x{A0}\x{AD}\x{200B}\x{2060}\x{3000}()\x{FF08}\x{FF09}\x{FF3B}\x{FF3D}\[\]~\x{2053}\x{223C}\x{FF5E}';
        $ext = self::extensionPattern();
        $viable = '/^[0-9]{2}$|^\+?(?:[' . $punct . ']*[0-9]){3,}[' . $punct . '0-9]*(?:' . $ext . ')?$/iu';
        if (strlen($text) < self::MIN_LENGTH_FOR_NSN || !preg_match($viable, $text)) {
            return null;
        }
        if (preg_match('/(?:' . $ext . ')$/iu', $text, $e, PREG_OFFSET_CAPTURE)) {
            $text = substr($text, 0, (int) $e[0][1]);
        }
        return $text;
    }

    private static function extensionPattern(): string
    {
        $sep = '[ \x{A0}\t,]*';
        $after = '[:\.\x{FF0E}]?[ \x{A0}\t,-]*';
        $explicit = '(?:e?xt(?:ensi(?:o\x{0301}?|\x{F3}))?n?|anexo)';
        $ambiguous = '(?:[x#~]|int)';
        return ';ext=([0-9]{1,20})'
            . '|' . $sep . $explicit . $after . '([0-9]{1,20})#?'
            . '|' . $sep . $ambiguous . $after . '([0-9]{1,9})#?'
            . '|[- ]+([0-9]{1,6})#'
            . '|[ \x{A0}\t]*(?:,{2}|;)' . $after . '([0-9]{1,15})#?'
            . '|[ \x{A0}\t]*(?:,)+' . $after . '([0-9]{1,9})#?';
    }

    /** Digits, with a leading "+" kept. */
    private static function keepDigits(string $s): string
    {
        $out = '';
        $len = strlen($s);
        for ($i = 0; $i < $len; $i++) {
            $ch = $s[$i];
            if ($ch >= '0' && $ch <= '9') {
                $out .= $ch;
            } elseif ($ch === '+' && $out === '') {
                $out .= $ch;
            }
        }
        return $out;
    }

    /**
     * @param array<string, mixed> $default
     * @return array{0: ?string, 1: ?string} [calling code or null, remaining number]
     */
    private static function extractCountryCallingCode(string $number, string $country, array $default): array
    {
        if ($number === '') {
            return [null, null];
        }
        if ($number[0] !== '+') {
            $stripped = self::stripIddPrefix($number, $default);
            if ($stripped !== null && $stripped !== $number) {
                $number = '+' . $stripped;
            } else {
                [$cc, $shorter] = self::withoutPlusSign($number, $default);
                if ($cc !== null) {
                    return [$cc, $shorter];
                }
                return [null, $number];
            }
        }
        if (isset($number[1]) && $number[1] === '0') {
            return [null, null];
        }
        $codes = self::data()['calling_codes'];
        for ($i = 2; $i - 1 <= self::MAX_LENGTH_COUNTRY_CODE && $i <= strlen($number); $i++) {
            $candidate = substr($number, 1, $i - 1);
            if (isset($codes[$candidate])) {
                return [$candidate, substr($number, $i)];
            }
        }
        return [null, null];
    }

    /** @param array<string, mixed> $plan */
    private static function stripIddPrefix(string $number, array $plan): ?string
    {
        $idd = $plan['idd'] ?? null;
        if ($idd === null || !preg_match(self::rx('^(?:' . $idd . ')'), $number, $m)) {
            return null;
        }
        $rest = substr($number, strlen($m[0]));
        if ($rest !== '' && preg_match('/[0-9]/', $rest, $d) && $d[0] === '0') {
            return null;
        }
        return $rest;
    }

    /**
     * A number typed with its calling code but no "+" (for example 263771234567).
     *
     * @param array<string, mixed> $plan
     * @return array{0: ?string, 1: ?string}
     */
    private static function withoutPlusSign(string $number, array $plan): array
    {
        $cc = (string) $plan['cc'];
        if (strncmp($number, $cc, strlen($cc)) !== 0) {
            return [null, null];
        }
        $shorter = substr($number, strlen($cc));
        $shorterNn = self::extractNationalNumber($shorter, null, $plan);
        $nn = self::extractNationalNumber($number, null, $plan);
        $pattern = (string) $plan['pattern'];
        if ((!self::matchesEntirely($nn, $pattern) && self::matchesEntirely($shorterNn, $pattern))
            || self::checkLength($nn, $plan) === 'TOO_LONG') {
            return [$cc, $shorter];
        }
        return [null, null];
    }

    /** @param array<string, mixed> $plan */
    private static function extractNationalNumber(string $number, ?string $country, array $plan): string
    {
        [$nationalNumber] = self::stripNationalPrefix($number, $plan);
        if ($nationalNumber !== $number) {
            if (self::matchesEntirely($number, (string) $plan['pattern']) && !self::matchesEntirely($nationalNumber, (string) $plan['pattern'])) {
                return $number;
            }
            if ($plan['lengths'] !== null) {
                $lengthPlan = $plan;
                $found = self::countryByCallingCode((string) $plan['cc'], $nationalNumber);
                if ($found !== null) {
                    $lengthPlan = self::country($found) ?? $plan;
                }
                $check = self::checkLength($nationalNumber, $lengthPlan);
                if ($check === 'TOO_SHORT' || $check === 'INVALID_LENGTH') {
                    return $number;
                }
            }
        }
        return $nationalNumber;
    }

    /**
     * @param array<string, mixed> $plan
     * @return array{0: string} national number after removing the national prefix
     */
    private static function stripNationalPrefix(string $number, array $plan): array
    {
        $parse = $plan['prefix_parse'] ?? null;
        if ($number === '' || $parse === null) {
            return [$number];
        }
        $re = self::rx('^(?:' . $parse . ')');
        if (!preg_match($re, $number, $m, PREG_UNMATCHED_AS_NULL)) {
            return [$number];
        }
        $groups = count($m) - 1;
        $hasGroups = $groups > 0 && $m[$groups] !== null && $m[$groups] !== '';
        if ($plan['transform'] !== null && $hasGroups) {
            return [(string) preg_replace($re, (string) $plan['transform'], $number, 1)];
        }
        return [substr($number, strlen((string) $m[0]))];
    }

    /** @param array<string, mixed> $plan */
    private static function checkLength(string $nn, array $plan): string
    {
        $lengths = $plan['lengths'] ?? null;
        if ($lengths === null) {
            return 'IS_POSSIBLE';
        }
        $actual = strlen($nn);
        if ($lengths[0] === $actual) {
            return 'IS_POSSIBLE';
        }
        if ($lengths[0] > $actual) {
            return 'TOO_SHORT';
        }
        if (end($lengths) < $actual) {
            return 'TOO_LONG';
        }
        return in_array($actual, array_slice($lengths, 1), true) ? 'IS_POSSIBLE' : 'INVALID_LENGTH';
    }

    private static function mainCountryFor(string $cc): ?string
    {
        return self::data()['calling_codes'][$cc][0] ?? null;
    }

    private static function countryByCallingCode(string $cc, string $nn): ?string
    {
        $countries = self::data()['calling_codes'][$cc] ?? null;
        if ($countries === null) {
            return null;
        }
        if (count($countries) === 1) {
            return $countries[0];
        }
        foreach ($countries as $code) {
            $plan = self::country($code);
            if ($plan === null) {
                continue;
            }
            if ($plan['leading'] !== null) {
                if ($nn !== '' && preg_match(self::rx('^(?:' . $plan['leading'] . ')'), $nn)) {
                    return $code;
                }
            } elseif (self::matchesAnyType($nn, $plan)) {
                return $code;
            }
        }
        return null;
    }

    /** @param array<string, mixed> $plan */
    private static function isValidNational(string $nn, array $plan): bool
    {
        if ($plan['types'] !== null) {
            return self::matchesAnyType($nn, $plan);
        }
        return self::matchesEntirely($nn, (string) $plan['pattern']);
    }

    /** @param array<string, mixed> $plan */
    private static function matchesAnyType(string $nn, array $plan): bool
    {
        if (!self::matchesEntirely($nn, (string) $plan['pattern'])) {
            return false;
        }
        foreach ($plan['types'] ?? [] as [$pattern, $lengths]) {
            if ($pattern === null || $pattern === '') {
                continue;
            }
            $allowed = $lengths ?? $plan['lengths'];
            if ($allowed !== null && !in_array(strlen($nn), $allowed, true)) {
                continue;
            }
            if (self::matchesEntirely($nn, (string) $pattern)) {
                return true;
            }
        }
        return false;
    }

    private static function matchesEntirely(string $text, string $pattern): bool
    {
        return $text !== '' && preg_match(self::rx('^(?:' . $pattern . ')$'), $text) === 1;
    }

    private static function rx(string $pattern): string
    {
        return '~' . $pattern . '~D';
    }
}
