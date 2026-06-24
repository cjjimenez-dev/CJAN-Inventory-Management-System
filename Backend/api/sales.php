<?php
require_once 'db.php';
header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $query = "SELECT s.*, p.name as product_name, p.base_price, p.profit 
                  FROM sales s 
                  JOIN products p ON s.product_id = p.id 
                  ORDER BY s.sale_date DESC";
        $stmt = $pdo->query($query);
        $sales = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($sales);
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"));
        if (!empty($data->product_id) && !empty($data->quantity_sold)) {
            try {
                $pdo->beginTransaction();

                // Get product details
                $stmt = $pdo->prepare("SELECT base_price, profit, quantity_in_stock FROM products WHERE id = :id");
                $stmt->bindParam(':id', $data->product_id);
                $stmt->execute();
                $product = $stmt->fetch(PDO::FETCH_ASSOC);

                if (!$product) {
                    throw new Exception("Product not found.");
                }

                if ($product['quantity_in_stock'] < $data->quantity_sold) {
                    throw new Exception("Not enough stock.");
                }

                $selling_price = $product['base_price'] + $product['profit'];
                $total_price = $selling_price * $data->quantity_sold;

                // Insert sale
                $stmt = $pdo->prepare("INSERT INTO sales (product_id, quantity_sold, total_price) VALUES (:product_id, :quantity_sold, :total_price)");
                $stmt->bindParam(':product_id', $data->product_id);
                $stmt->bindParam(':quantity_sold', $data->quantity_sold);
                $stmt->bindParam(':total_price', $total_price);
                $stmt->execute();

                // Update stock
                $new_stock = $product['quantity_in_stock'] - $data->quantity_sold;
                $stmt = $pdo->prepare("UPDATE products SET quantity_in_stock = :new_stock WHERE id = :id");
                $stmt->bindParam(':new_stock', $new_stock);
                $stmt->bindParam(':id', $data->product_id);
                $stmt->execute();

                $pdo->commit();
                echo json_encode(["message" => "Sale recorded successfully."]);

            } catch (Exception $e) {
                $pdo->rollBack();
                http_response_code(400);
                echo json_encode(["message" => "Error: " . $e->getMessage()]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["message" => "Incomplete data."]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(["message" => "Method not allowed"]);
        break;
}
