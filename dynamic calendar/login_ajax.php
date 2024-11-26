<?php
require 'database.php';
header("Content-Type: application/json");

$json_str = file_get_contents('php://input');
$json_obj = json_decode($json_str, true);

$username = $json_obj['username'];
$password = $json_obj['password'];

$stmt = $mysqli->prepare("select count(*), password from users where username=?");
if(!$stmt){
    printf("Query Prep Failed: %s\n", $mysqli->error);
    exit;
}

$stmt->bind_param('s', $username);
$stmt->execute();
$stmt->bind_result($cnt, $pwd_hash);
$stmt->fetch();
$stmt->close();

if($cnt == 1 && password_verify($password, $pwd_hash)){
	ini_set("session.cookie_httponly", 1);
	session_start();
	$_SESSION['username'] = $username;
	$_SESSION['token'] = bin2hex(openssl_random_pseudo_bytes(32));
	$token = $_SESSION['token'];

	echo json_encode(array(
		"success" => true,
		"token" => $token
	));
	exit;
}else{
	echo json_encode(array(
		"success" => false,
		"message" => "Incorrect Username or Password"
	));
	exit;
}

?>