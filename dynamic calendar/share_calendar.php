<?php
ini_set("session.cookie_httponly", 1);
session_start();
require 'database.php';
header("Content-Type: application/json");

if (!isset($_SESSION["username"])) {
    echo json_encode(array(
        "success" => false,
        "message" => "User is not logged in."
    ));
    exit;
}

$json_str = file_get_contents('php://input');
$json_obj = json_decode($json_str, true);

$token = $json_obj['token'];
if (!hash_equals($_SESSION['token'], $token)) {
    echo json_encode([
        "success" => false,
        "message" => "Request forgery detected"
    ]);
    exit;
}

$username = $_SESSION['username'];
$recipient = trim($json_obj['recipient']);

// Check if the user is trying to share with oneself
if ($username === $recipient) {
    echo json_encode([
        "success" => false,
        "message" => "You cannot share your calendar with yourself."
    ]);
    exit;
}

// Check if the recipient username exists
$stmt = $mysqli->prepare("SELECT username FROM users WHERE username = ?");
$stmt->bind_param('s', $recipient);
$stmt->execute();
$result = $stmt->get_result();
if ($result->num_rows === 0) {
    echo json_encode([
        "success" => false,
        "message" => "This username does not exist."
    ]);
    exit;
}
$stmt->close();

// Fetch all events for the current user
$stmt = $mysqli->prepare("SELECT event_title, event_date, event_time, event_category, isGroup FROM events WHERE username = ?");
$stmt->bind_param('s', $username);
$stmt->execute();
$result = $stmt->get_result();

$events = $result->fetch_all(MYSQLI_ASSOC);
$stmt->close();


foreach ($events as $event) {
    // Check if the event already exists for the recipient
    $stmt = $mysqli->prepare("SELECT COUNT(*) FROM events WHERE username = ? AND event_title = ? AND event_date = ? AND event_time = ?");
    $stmt->bind_param('ssss', $recipient, $event['event_title'], $event['event_date'], $event['event_time']);
    $stmt->execute();
    $stmt->bind_result($count);
    $stmt->fetch();
    $stmt->close();

    // Only insert the event if it does not already exist
    if ($count == 0) {
        $stmt = $mysqli->prepare("INSERT INTO events (username, event_title, event_date, event_time, event_category, isGroup) VALUES (?,?, ?, ?, ?, ?)");
        $stmt->bind_param('sssssi', $recipient, $event['event_title'], $event['event_date'], $event['event_time'],$event['event_category'],$event['isGroup']);
        
        if (!$stmt->execute()) {
            echo json_encode([
                "success" => false,
                "message" => "Failed to share event: " . htmlspecialchars($event['event_title'])
            ]);
            $stmt->close();
            exit;
        }
        $stmt->close();
    }
}

echo json_encode([
    "success" => true,
    "message" => "All events successfully shared with " . htmlspecialchars($recipient)
]);
?>