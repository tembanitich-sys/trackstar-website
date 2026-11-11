<?php
declare(strict_types=1);

require_once __DIR__ . '/handler.php';
require_once __DIR__ . '/services.php';

/** Sends the JSON reply and stops. */
function trackstar_respond(int $status, array $body): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    header('X-Content-Type-Options: nosniff');
    echo json_encode($body, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

/** Entry point shared by enquiry.php and contact.php. */
function trackstar_run(string $scope): void
{
    ini_set('display_errors', '0');
    $services = new TrackStarServices(__DIR__ . '/../logs');

    try {
        if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
            header('Allow: POST');
            trackstar_respond(405, ['ok' => false, 'message' => 'Method not allowed.']);
        }

        // Only this site's own pages may post here.
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        if ($origin !== '' && strcasecmp((string) parse_url($origin, PHP_URL_HOST), explode(':', (string) ($_SERVER['HTTP_HOST'] ?? ''))[0]) !== 0) {
            trackstar_respond(403, ['ok' => false, 'message' => 'Forbidden.']);
        }

        if (stripos((string) ($_SERVER['CONTENT_TYPE'] ?? ''), 'application/json') === false) {
            trackstar_respond(415, ['ok' => false, 'message' => 'Unsupported content type.']);
        }
        $raw = (string) file_get_contents('php://input', false, null, 0, 65537);
        if (strlen($raw) > 65536) {
            trackstar_respond(413, ['ok' => false, 'message' => 'Request too large.']);
        }
        $input = json_decode($raw, true);
        if (!is_array($input) || ($input !== [] && array_keys($input) === range(0, count($input) - 1))) {
            trackstar_respond(400, ['ok' => false, 'message' => 'Invalid request.']);
        }

        [$status, $body] = TrackStarHandler::handle($scope, $input, [
            'now' => static fn (): DateTimeImmutable => new DateTimeImmutable('now', new DateTimeZone('UTC')),
            'rate_limit' => [$services, 'allowRequest'],
            'turnstile_enabled' => [$services, 'turnstileEnabled'],
            'verify_turnstile' => [$services, 'verifyTurnstile'],
            'store' => [$services, 'store'],
            'send_mail' => [$services, 'sendMail'],
            'log' => [$services, 'log'],
        ]);
        trackstar_respond($status, $body);
    } catch (Throwable $e) {
        $services->log("{$scope} endpoint: unexpected failure", $e->getMessage());
        trackstar_respond(500, ['ok' => false, 'message' => TrackStarHandler::GENERIC_ERROR]);
    }
}
