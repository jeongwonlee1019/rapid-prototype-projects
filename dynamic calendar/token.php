<?php
    ini_set("session.cookie_httponly", 1);
    session_start();
    header("Content-Type: application/json");

    if (session_status() == PHP_SESSION_ACTIVE) {
        if (!isset($_SESSION['token'])) {
            $_SESSION['token'] = bin2hex(random_bytes(32));
        }
        echo json_encode(array(
            "token" => $_SESSION['token']
        ));
    } else {
        echo json_encode(array(
            "token" => null,
            "message" => "Session is currently inactive or expired."
        ));
    }
?>
