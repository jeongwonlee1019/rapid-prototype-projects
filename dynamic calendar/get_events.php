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

$username = $_SESSION['username'];

$stmt = $mysqli->prepare("SELECT event_id, event_title, event_date, event_time, event_category, isGroup FROM events WHERE username = ?");
$stmt->bind_param('s', $username);
$stmt->execute();
$stmt->bind_result($event_id, $event_title, $event_date, $event_time, $event_category, $isGroup);

$events = array();
while ($stmt->fetch()) {
    $events[] = array(
        "event_id" => $event_id,
        "title" => $event_title,
        "date" => $event_date,
        "time" => $event_time,
        "category" =>$event_category,
        "isGroup" =>$isGroup
    );
}

$stmt->close();

echo json_encode(array(
    "success" => true,
    "events" => $events
));
?>
