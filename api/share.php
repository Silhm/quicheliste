<?php
require_once __DIR__ . '/helpers.php';
cors();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') json_response(['error' => 'Method not allowed'], 405);

$shareToken = $_GET['token'] ?? null;
if (!$shareToken) json_response(['error' => 'Missing token'], 400);

foreach (getAllWishlists() as $wl) {
    if ($wl['share_token'] === $shareToken) {
        // Hide who reserved — only expose whether the item is taken
        foreach ($wl['items'] as &$item) {
            $item['reserved'] = !empty($item['reserved_by']);
            unset($item['reserved_by']);
        }
        json_response($wl);
    }
}

json_response(['error' => 'Not found'], 404);
