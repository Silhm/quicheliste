<?php
require_once __DIR__ . '/config.php';

function cors(): void {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, X-Token');
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }
    header('Content-Type: application/json; charset=utf-8');
}

function json_response(mixed $data, int $code = 200): never {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function readJson(string $path): mixed {
    if (!file_exists($path)) return null;
    $fp = fopen($path, 'r');
    flock($fp, LOCK_SH);
    $content = stream_get_contents($fp);
    flock($fp, LOCK_UN);
    fclose($fp);
    return json_decode($content, true);
}

function writeJson(string $path, mixed $data): void {
    $dir = dirname($path);
    if (!is_dir($dir)) mkdir($dir, 0755, true);
    $fp = fopen($path, 'c');
    flock($fp, LOCK_EX);
    ftruncate($fp, 0);
    rewind($fp);
    fwrite($fp, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
    flock($fp, LOCK_UN);
    fclose($fp);
}

function generateToken(int $bytes = 12): string {
    return bin2hex(random_bytes($bytes));
}

function generateId(): string {
    return bin2hex(random_bytes(8));
}

function getUsers(): array {
    return readJson(DATA_PATH . '/users.json') ?? [];
}

function saveUsers(array $users): void {
    writeJson(DATA_PATH . '/users.json', $users);
}

function getUserByToken(string $token): ?array {
    foreach (getUsers() as $user) {
        if ($user['token'] === $token) return $user;
    }
    return null;
}

function authenticate(): array {
    $headers = getallheaders();
    $token = $headers['X-Token'] ?? $headers['x-token'] ?? null;
    if (!$token) json_response(['error' => 'Unauthorized'], 401);
    $user = getUserByToken($token);
    if (!$user) json_response(['error' => 'Invalid token'], 401);
    return $user;
}

function getWishlist(string $id): ?array {
    return readJson(DATA_PATH . '/wishlists/' . $id . '.json');
}

function saveWishlist(array $wishlist): void {
    writeJson(DATA_PATH . '/wishlists/' . $wishlist['id'] . '.json', $wishlist);
}

function deleteWishlist(string $id): void {
    $path = DATA_PATH . '/wishlists/' . $id . '.json';
    if (file_exists($path)) unlink($path);
}

function getAllWishlists(): array {
    $dir = DATA_PATH . '/wishlists/';
    if (!is_dir($dir)) return [];
    $wishlists = [];
    foreach (glob($dir . '*.json') as $file) {
        $wl = json_decode(file_get_contents($file), true);
        if ($wl) $wishlists[] = $wl;
    }
    return $wishlists;
}

function body(): array {
    return json_decode(file_get_contents('php://input'), true) ?? [];
}
