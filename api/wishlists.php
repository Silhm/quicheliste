<?php
require_once __DIR__ . '/helpers.php';
cors();

$user   = authenticate();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $all = getAllWishlists();
    // Return all wishlists — frontend separates mine vs. others
    // Strip items for the list view to keep payload small
    $summaries = array_map(fn($wl) => [
        'id'          => $wl['id'],
        'owner_id'    => $wl['owner_id'],
        'owner_name'  => $wl['owner_name'],
        'title'       => $wl['title'],
        'description' => $wl['description'],
        'share_token' => $wl['share_token'],
        'item_count'  => count($wl['items']),
        'created_at'  => $wl['created_at'],
    ], $all);
    json_response(array_values($summaries));

} elseif ($method === 'POST') {
    $body  = body();
    $title = trim($body['title'] ?? '');
    if (!$title) json_response(['error' => 'Title is required'], 400);

    $wishlist = [
        'id'          => generateId(),
        'owner_id'    => $user['id'],
        'owner_name'  => $user['name'],
        'title'       => $title,
        'description' => trim($body['description'] ?? ''),
        'share_token' => generateToken(10),
        'items'       => [],
        'created_at'  => date('c'),
    ];
    saveWishlist($wishlist);
    json_response($wishlist, 201);

} else {
    json_response(['error' => 'Method not allowed'], 405);
}
