<?php
require_once __DIR__ . '/helpers.php';
cors();

$user       = authenticate();
$method     = $_SERVER['REQUEST_METHOD'];
$itemId     = $_GET['id'] ?? null;
$wishlistId = $_GET['wishlist_id'] ?? null;

if (!$itemId || !$wishlistId) json_response(['error' => 'Missing params'], 400);

$wishlist = getWishlist($wishlistId);
if (!$wishlist) json_response(['error' => 'Not found'], 404);

if ($wishlist['owner_id'] !== $user['id'] && !$user['is_admin']) {
    json_response(['error' => 'Forbidden'], 403);
}

$idx = null;
foreach ($wishlist['items'] as $i => $item) {
    if ($item['id'] === $itemId) { $idx = $i; break; }
}
if ($idx === null) json_response(['error' => 'Item not found'], 404);

if ($method === 'PUT') {
    $body = body();
    $item = &$wishlist['items'][$idx];
    if (array_key_exists('name', $body))        $item['name']        = trim($body['name']);
    if (array_key_exists('price', $body))       $item['price']       = $body['price'] !== '' && $body['price'] !== null ? (float)$body['price'] : null;
    if (array_key_exists('link', $body))        $item['link']        = trim($body['link']);
    if (array_key_exists('description', $body)) $item['description'] = trim($body['description']);
    if (array_key_exists('category', $body))    $item['category']    = trim($body['category']) ?: 'General';
    if (array_key_exists('sort_order', $body))  $item['sort_order']  = (int)$body['sort_order'];
    saveWishlist($wishlist);
    json_response($item);

} elseif ($method === 'DELETE') {
    array_splice($wishlist['items'], $idx, 1);
    saveWishlist($wishlist);
    json_response(['success' => true]);

} else {
    json_response(['error' => 'Method not allowed'], 405);
}
