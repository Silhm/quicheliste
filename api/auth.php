<?php
require_once __DIR__ . '/helpers.php';
cors();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_response(['error' => 'Method not allowed'], 405);

$body = body();
$name = trim($body['name'] ?? '');
if (!$name) json_response(['error' => 'Name is required'], 400);

$users = getUsers();

do { $token = generateToken(12); }
while (array_filter($users, fn($u) => $u['token'] === $token));

$user = [
    'id'         => generateId(),
    'name'       => $name,
    'token'      => $token,
    'is_admin'   => empty($users), // first registered user is admin
    'created_at' => date('c'),
];

$users[] = $user;
saveUsers($users);

json_response(['user' => $user, 'token' => $token], 201);
