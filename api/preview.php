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
        'timeout'         => 8,
        'follow_location' => true,
        'max_redirects'   => 5,
        'header'          => implode("\r\n", [
            'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language: fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
            'Accept-Encoding: identity',
            'Upgrade-Insecure-Requests: 1',
        ]),
    ],
    'ssl' => ['verify_peer' => false, 'verify_peer_name' => false],
]);

// Fetch up to 100KB — enough for large <head> sections
$html = @file_get_contents($url, false, $context, 0, 102400);
if (!$html) json_response(['image' => null]);

// Work only on the <head> section when possible
if (preg_match('/<head[\s>].*?<\/head>/is', $html, $m)) {
    $html = $m[0];
}

// og:image and twitter:image — both attribute orders, flexible quoting
$patterns = [
    '/<meta\s[^>]*property=["\']og:image["\'][^>]*content=["\']([^"\']+)["\']/i',
    '/<meta\s[^>]*content=["\']([^"\']+)["\'][^>]*property=["\']og:image["\']/i',
    '/<meta\s[^>]*name=["\']twitter:image[^"\']*["\'][^>]*content=["\']([^"\']+)["\']/i',
    '/<meta\s[^>]*content=["\']([^"\']+)["\'][^>]*name=["\']twitter:image[^"\']*["\']/i',
];

foreach ($patterns as $pattern) {
    if (preg_match($pattern, $html, $m)) {
        $image = html_entity_decode($m[1], ENT_QUOTES | ENT_HTML5);
        // Handle protocol-relative URLs
        if (str_starts_with($image, '//')) {
            $image = $scheme . ':' . $image;
        }
        if (strlen($image) > 10) {
            json_response(['image' => $image]);
        }
    }
}

json_response(['image' => null]);
