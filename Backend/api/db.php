<?php
// cors.php - Allow CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// MySQL Database Credentials
$host = '127.0.0.1';
$db   = 'inventory_db';
$user = 'root'; // Change if necessary
$pass = '';     // Change if necessary
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;charset=$charset";

try {
    $pdo = new PDO($dsn, $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Create database if it doesn't exist and select it
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `$db`");
    $pdo->exec("USE `$db`");

    // Initialize database schema
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS categories (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL UNIQUE
        );

        CREATE TABLE IF NOT EXISTS products (
            id INT AUTO_INCREMENT PRIMARY KEY,
            category_id INT,
            name VARCHAR(255) NOT NULL,
            base_price DECIMAL(10, 2) NOT NULL,
            profit DECIMAL(10, 2) NOT NULL,
            quantity_in_stock INT NOT NULL DEFAULT 0,
            FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
        );

        CREATE TABLE IF NOT EXISTS sales (
            id INT AUTO_INCREMENT PRIMARY KEY,
            product_id INT,
            quantity_sold INT NOT NULL,
            total_price DECIMAL(10, 2) NOT NULL,
            sale_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
        );
    ");

    // Seed default category if empty
    $stmt = $pdo->query("SELECT COUNT(*) FROM categories");
    if ($stmt->fetchColumn() == 0) {
        $pdo->exec("INSERT INTO categories (name) VALUES ('General')");
    }

} catch (PDOException $e) {
    header('Content-Type: application/json');
    echo json_encode(["error" => "Database connection failed: " . $e->getMessage()]);
    exit();
}
