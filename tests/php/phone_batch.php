<?php
// Reads a JSON array of [input, country] pairs on stdin; prints the E.164 result (or null) for each.
require __DIR__ . '/../../public/api/lib/phone.php';
$cases = json_decode((string) stream_get_contents(STDIN), true, 512, JSON_THROW_ON_ERROR);
echo json_encode(array_map(fn ($c) => TrackStarPhone::toE164($c[0], $c[1]), $cases), JSON_UNESCAPED_SLASHES);
