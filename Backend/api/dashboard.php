<?php
require_once 'db.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        // Total Sales Amount
        $stmtSales = $pdo->query("SELECT IFNULL(SUM(total_price), 0) as total_sales FROM sales");
        $totalSales = $stmtSales->fetchColumn();

        // Total Profit
        $stmtProfit = $pdo->query("
            SELECT IFNULL(SUM(p.profit * s.quantity_sold), 0) as total_profit 
            FROM sales s 
            JOIN products p ON s.product_id = p.id
        ");
        $totalProfit = $stmtProfit->fetchColumn();

        // Total Products Types
        $stmtProducts = $pdo->query("SELECT COUNT(*) FROM products");
        $totalProducts = $stmtProducts->fetchColumn();

        // Low Stock Items (< 10)
        $stmtLowStock = $pdo->query("SELECT COUNT(*) FROM products WHERE quantity_in_stock < 10");
        $lowStock = $stmtLowStock->fetchColumn();

        echo json_encode([
            "total_sales" => (float)$totalSales,
            "total_profit" => (float)$totalProfit,
            "total_products" => (int)$totalProducts,
            "low_stock_alerts" => (int)$lowStock
        ]);

    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["message" => "Database error: " . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(["message" => "Method not allowed"]);
}
