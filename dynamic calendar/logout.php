<?php
ini_set("session.cookie_httponly", 1);
session_start();
session_destroy();
header("Content-Type: application/json");
echo json_encode(array(
    "success" => true
));
?>