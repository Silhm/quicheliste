<?php
require_once __DIR__ . '/helpers.php';
cors();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') json_response(['image' => null]);

$url = $_GET['url'] ?? '';
if (!filter_var($url, FILTER_VALIDATE_URL)) json_response(['image' => null]);

$scheme = parse_url($url, PHP_URL_SCHEME);
if (!in_array($scheme, ['http', 'https'], true)) json_response(['image' => null]);

$context = stream_context_create([
    'http' => [
        'method'          => 'GET',
        'timeout'         => 5,
        'follow_location' => true,
        'max_redirects'   => 3,
        'header'          => "User-Agent: Mozilla/5.0 (compatible)\r\nAccept: text/html",
    ],
    'ssl'  => ['verify_peer' => false, 'verify_peer_name' => false],
]);

// Fetch only first 60KB — enough to capture the <head>
$html = @file_get_contents($url, false, $context, 0, 61440);
if (!$html) json_response(['image' => null]);

// Try og:image then twitter:image, both attribute orders
$patterns = [
    '/<meta[^>]+property=["\']og:image["\'][^>]+content=["\'](https?:[^"\']+)["\']/',
    '/<meta[^>]+content=["\'](https?:[^"\']+)["\'][^>]+property=["\']og:image["\']/',
    '/<meta[^>]+name=["\']twitter:image(?::src)?["\'][^>]+content=["\'](https?:[^"\']+)["\']/',
    '/<meta[^>]+content=["\'](https?:[^"\']+)["\'][^>]+name=["\']twitter:image(?::src)?["\']/',
];

foreach ($patterns as $pattern) {
    if (preg_match($pattern, $html, $m)) {
        json_response(['image' => html_entity_decode($m[1])]);
    }
}

json_response(['image' => null]);
