<?php
ini_set("session.cookie_httponly", 1);
session_start();
header("Content-Type: application/json");

if (isset($_SESSION['username'])) {
    echo json_encode(array(
        "success" => true,
        "loggedIn" => true
    ));
} else {
    echo json_encode(array(
        "success" => true,
        "loggedIn" => false
    ));
}
?>
