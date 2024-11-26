<?php
ini_set("session.cookie_httponly", 1);
session_start();
require 'database.php';
header("Content-Type: application/json");

if (!isset($_SESSION['username'])) {
    echo json_encode([
        "success" => false,
        "message" => "User is not logged in."
    ]);
    exit;
}

$json_str = file_get_contents('php://input');
$json_obj = json_decode($json_str, true);

$token = $json_obj['token'];
if(!hash_equals($_SESSION['token'], $token)) {
    echo json_encode([
        "success" => false,
        "message" => "Request forgery detected"
    ]);
    exit;
}

$username = $_SESSION['username'];
$event_id = $json_obj['event_id'];

$stmt = $mysqli->prepare("DELETE FROM events WHERE event_id = ? AND username = ?");
$stmt->bind_param('is', $event_id, $username);

if ($stmt->execute()) {
    echo json_encode([
        "success" => true
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Failed to delete event."
    ]);
}

$stmt->close();

?>