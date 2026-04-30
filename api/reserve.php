<?php
require_once __DIR__ . '/helpers.php';
cors();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_response(['error' => 'Method not allowed'], 405);

$body       = body();
$shareToken = $body['share_token'] ?? null;
$itemId     = $body['item_id'] ?? null;
$name       = trim($body['name'] ?? '');

if (!$shareToken || !$itemId) json_response(['error' => 'Missing params'], 400);
if (!$name) json_response(['error' => 'Your name is required'], 400);

foreach (getAllWishlists() as $wl) {
    if ($wl['share_token'] !== $shareToken) continue;

    foreach ($wl['items'] as &$item) {
        if ($item['id'] !== $itemId) continue;
        if (!empty($item['reserved_by'])) json_response(['error' => 'Already reserved'], 409);
        $item['reserved_by'] = $name;
        saveWishlist($wl);
        json_response(['success' => true]);
    }

    json_response(['error' => 'Item not found'], 404);
}

json_response(['error' => 'Wishlist not found'], 404);
