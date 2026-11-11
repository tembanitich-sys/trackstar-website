<?php
declare(strict_types=1);

/**
 * The product name used in e-mails. It comes from site.config.json (copied next to this
 * folder as api/site.config.json by scripts/sync-site-config.mjs), the same single setting
 * the website uses, so the two cannot disagree.
 */
final class TrackStarBrand
{
    /** @param string|null $file only tests pass a file; the site always uses the copy next to the scripts */
    public static function name(?string $file = null): string
    {
        static $cached = null;
        if ($file === null && $cached !== null) {
            return $cached;
        }
        $path = $file ?? __DIR__ . '/../site.config.json';
        $json = is_file($path) ? json_decode((string) file_get_contents($path), true) : null;
        $value = is_array($json) ? ($json['productName'] ?? '') : '';
        $name = is_string($value) && trim($value) !== '' ? trim($value) : 'Website';
        if ($file === null) {
            $cached = $name;
        }
        return $name;
    }
}
