<?php
// referrenced from CSE330 Wiki
session_start();
require 'database.php';

$stmt = $mysqli->prepare("select count(*), password from users where username=?");
if(!$stmt){
    printf("Query Prep Failed: %s\n", $mysqli->error);
    exit;
}

$username = $mysqli->real_escape_string($_POST['username']);
$stmt->bind_param('s', $username);
$stmt->execute();

$stmt->bind_result($cnt, $pwd_hash);
$stmt->fetch();
$stmt->close();

$pwd_guess = $_POST['password'];

if($cnt == 1 && password_verify($pwd_guess, $pwd_hash)){
    $_SESSION['username'] = $username;
    $_SESSION['token'] = bin2hex(openssl_random_pseudo_bytes(32));
    header("Location: userhome.php");
} else{
    header("Location: loginfail.html");
}
?>