<?php
require_once 'db.php';
header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $stmt = $pdo->query("SELECT * FROM categories ORDER BY name ASC");
        $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($categories);
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"));
        if (!empty($data->name)) {
            try {
                $stmt = $pdo->prepare("INSERT INTO categories (name) VALUES (:name)");
                $stmt->bindParam(':name', $data->name);
                if ($stmt->execute()) {
                    echo json_encode(["message" => "Category created.", "id" => $pdo->lastInsertId()]);
                } else {
                    http_response_code(500);
                    echo json_encode(["message" => "Failed to create category."]);
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
            // Check if category has products
            $check = $pdo->prepare("SELECT COUNT(*) FROM products WHERE category_id = :id");
            $check->bindParam(':id', $data->id);
            $check->execute();
            if ($check->fetchColumn() > 0) {
                http_response_code(400);
                echo json_encode(["message" => "Cannot delete category: products exist in this category."]);
                break;
            }

            $stmt = $pdo->prepare("DELETE FROM categories WHERE id = :id");
            $stmt->bindParam(':id', $data->id);
            if ($stmt->execute()) {
                echo json_encode(["message" => "Category deleted."]);
            } else {
                http_response_code(500);
                echo json_encode(["message" => "Failed to delete category."]);
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
