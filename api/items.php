<?php
require_once __DIR__ . '/helpers.php';
cors();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_response(['error' => 'Method not allowed'], 405);

$user = authenticate();
$body = body();

$wishlistId = $body['wishlist_id'] ?? null;
if (!$wishlistId) json_response(['error' => 'Missing wishlist_id'], 400);

$wishlist = getWishlist($wishlistId);
if (!$wishlist) json_response(['error' => 'Not found'], 404);

if ($wishlist['owner_id'] !== $user['id'] && !$user['is_admin']) {
    json_response(['error' => 'Forbidden'], 403);
}

$name = trim($body['name'] ?? '');
if (!$name) json_response(['error' => 'Name is required'], 400);

$category = trim($body['category'] ?? '') ?: 'General';

$inCategory = array_filter($wishlist['items'], fn($i) => $i['category'] === $category);
$maxOrder   = empty($inCategory) ? 0 : max(array_column(array_values($inCategory), 'sort_order'));

$item = [
    'id'          => generateId(),
    'name'        => $name,
    'price'       => isset($body['price']) && $body['price'] !== '' ? (float)$body['price'] : null,
    'link'        => trim($body['link'] ?? ''),
    'description' => trim($body['description'] ?? ''),
    'category'    => $category,
    'sort_order'  => $maxOrder + 1,
    'reserved_by' => null,
    'created_at'  => date('c'),
];

$wishlist['items'][] = $item;
saveWishlist($wishlist);
json_response($item, 201);
