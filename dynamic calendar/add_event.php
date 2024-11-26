<?php
ini_set("session.cookie_httponly", 1);
session_start();
require 'database.php';
header("Content-Type: application/json");

if (!isset($_SESSION["username"])) {
    echo json_encode([
        "success" => false,
        "message" => "User is not logged in."
    ]);
    exit;
}

$json_str = file_get_contents('php://input');
$json_obj = json_decode($json_str, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid JSON input."
    ]);
    exit;
}

if (!isset($json_obj['token']) || !hash_equals($_SESSION['token'], $json_obj['token'])) {
    echo json_encode([
        "success" => false,
        "message" => "Request forgery detected"
    ]);
    exit;
}

$username = $_SESSION['username'];
$event_title = $json_obj['event_title'];
$event_date = $json_obj['event_date'];
$event_time = $json_obj['event_time'];
$event_category = $json_obj['event_category'];
$isGroup = isset($json_obj['group-event-checkbox']) && $json_obj['group-event-checkbox'] === '1' ? 1 : 0;
$shareWith = isset($json_obj['shareWith']) ? $json_obj['shareWith'] : [];

// Exit if attempting to share with oneself
if (!empty($shareWith)) {
    foreach ($shareWith as $sharedUsername) {
        if ($username === $sharedUsername) {
            echo json_encode([
                "success" => false,
                "message" => "You cannot share your event with yourself."
            ]);
            exit; 
        }
    }
}

// Check if each username in shareWith exists
$nonexistent = [];
foreach ($shareWith as $sharedUsername) {
    $stmt = $mysqli->prepare("SELECT username FROM users WHERE username = ?");
    $stmt->bind_param('s', $sharedUsername);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($result->num_rows === 0) {
        $nonexistent[] = $sharedUsername;
    }
    $stmt->close();
}

if (!empty($nonexistent)) {
    echo json_encode([
        "success" => false,
        "message" => "The following usernames do not exist: " . implode(", ", $nonexistent)
    ]);
    exit;
}

$stmt = $mysqli->prepare("INSERT INTO events (username, event_title, event_date, event_time, event_category, isGroup) VALUES (?, ?, ?, ?, ?, ?)");
$stmt->bind_param('sssssi', $username, $event_title, $event_date, $event_time, $event_category, $isGroup);

if ($stmt->execute()) {
    // If it's a group event, handle sharing logic
    if (!empty($shareWith)) {
        foreach ($shareWith as $sharedUsername) {
            $shareStmt = $mysqli->prepare("INSERT INTO events (username, event_title, event_date, event_time, event_category, isGroup) VALUES (?, ?, ?, ?, ?, ?)");
            $shareStmt->bind_param('sssssi', $sharedUsername, $event_title, $event_date, $event_time, $event_category, $isGroup);
            if (!$shareStmt->execute()) {
                echo json_encode(['success' => false, 'message' => 'Database error when sharing: ' . $shareStmt->error]);
                $shareStmt->close();
                exit;
            }
            $shareStmt->close();
        }
    }
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $stmt->error]);
}

$stmt->close(); 
$mysqli->close(); 
?>