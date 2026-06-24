<?php
require_once 'db.php';
header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $query = "SELECT p.*, c.name as category_name 
                  FROM products p 
                  LEFT JOIN categories c ON p.category_id = c.id 
                  ORDER BY p.id DESC";
        $stmt = $pdo->query($query);
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($products);
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"));
        if (!empty($data->name) && isset($data->base_price) && isset($data->profit)) {
            $category_id = $data->category_id ?? null;
            $quantity_in_stock = $data->quantity_in_stock ?? 0;
            
            try {
                $stmt = $pdo->prepare("INSERT INTO products (category_id, name, base_price, profit, quantity_in_stock) VALUES (:category_id, :name, :base_price, :profit, :quantity_in_stock)");
                $stmt->bindParam(':category_id', $category_id);
                $stmt->bindParam(':name', $data->name);
                $stmt->bindParam(':base_price', $data->base_price);
                $stmt->bindParam(':profit', $data->profit);
                $stmt->bindParam(':quantity_in_stock', $quantity_in_stock);
                
                if ($stmt->execute()) {
                    echo json_encode(["message" => "Product created.", "id" => $pdo->lastInsertId()]);
                } else {
                    http_response_code(500);
                    echo json_encode(["message" => "Failed to create product."]);
                }
            } catch (PDOException $e) {
                http_response_code(400);
                echo json_encode(["message" => "Error: " . $e->getMessage()]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["message" => "Incomplete data."]);
        }
        break;

    case 'PUT':
        $data = json_decode(file_get_contents("php://input"));
        if (!empty($data->id) && !empty($data->name) && isset($data->base_price) && isset($data->profit)) {
            $category_id = $data->category_id ?? null;
            $quantity_in_stock = $data->quantity_in_stock ?? 0;
            
            try {
                $stmt = $pdo->prepare("UPDATE products SET category_id = :category_id, name = :name, base_price = :base_price, profit = :profit, quantity_in_stock = :quantity_in_stock WHERE id = :id");
                $stmt->bindParam(':id', $data->id);
                $stmt->bindParam(':category_id', $category_id);
                $stmt->bindParam(':name', $data->name);
                $stmt->bindParam(':base_price', $data->base_price);
                $stmt->bindParam(':profit', $data->profit);
                $stmt->bindParam(':quantity_in_stock', $quantity_in_stock);
                
                if ($stmt->execute()) {
                    echo json_encode(["message" => "Product updated."]);
                } else {
                    http_response_code(500);
                    echo json_encode(["message" => "Failed to update product."]);
                }
            } catch (PDOException $e) {
                http_response_code(400);
                echo json_encode(["message" => "Error: " . $e->getMessage()]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["message" => "Incomplete data."]);
        }
        break;

    case 'DELETE':
        $data = json_decode(file_get_contents("php://input"));
        if (!empty($data->id)) {
            try {
                $stmt = $pdo->prepare("DELETE FROM products WHERE id = :id");
                $stmt->bindParam(':id', $data->id);
                if ($stmt->execute()) {
                    echo json_encode(["message" => "Product deleted."]);
                } else {
                    http_response_code(500);
                    echo json_encode(["message" => "Failed to delete product."]);
                }
            } catch (PDOException $e) {
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
