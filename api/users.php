<?php
require_once __DIR__ . '/helpers.php';
cors();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') json_response(['error' => 'Method not allowed'], 405);

$user = authenticate();
if (!$user['is_admin']) json_response(['error' => 'Forbidden'], 403);

json_response(getUsers());
