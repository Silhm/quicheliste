<?php
require_once __DIR__ . '/helpers.php';
cors();

$user   = authenticate();
$method = $_SERVER['REQUEST_METHOD'];
$id     = $_GET['id'] ?? null;

if (!$id) json_response(['error' => 'Missing id'], 400);

$wishlist = getWishlist($id);
if (!$wishlist) json_response(['error' => 'Not found'], 404);

if ($wishlist['owner_id'] !== $user['id'] && !$user['is_admin']) {
    json_response(['error' => 'Forbidden'], 403);
}

if ($method === 'GET') {
    json_response($wishlist);

} elseif ($method === 'PUT') {
    $body = body();
    if (isset($body['title']))       $wishlist['title']       = trim($body['title']);
    if (isset($body['description'])) $wishlist['description'] = trim($body['description']);
    saveWishlist($wishlist);
    json_response($wishlist);

} elseif ($method === 'DELETE') {
    deleteWishlist($id);
    json_response(['success' => true]);

} else {
    json_response(['error' => 'Method not allowed'], 405);
}
