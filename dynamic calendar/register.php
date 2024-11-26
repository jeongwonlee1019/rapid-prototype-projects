<?php
require 'database.php';
header("Content-Type: application/json");

$json_str = file_get_contents('php://input');
$json_obj = json_decode($json_str, true);

$username = $json_obj['new_username'];
$password = $json_obj['new_password'];

if(strlen($username) > 30) {
	echo json_encode(array(
		"success" => false,
		"message" => "Your username is too long."
	));
	exit;
}
if(strlen($password) > 30) {
	echo json_encode(array(
		"success" => false,
		"message" => "Your password is too long."
	));
	exit;
}

$stmt = $mysqli->prepare("SELECT COUNT(*) FROM users WHERE username=?");
if(!$stmt){
	printf("Query Prep Failed: %s\n", $mysqli->error);
	exit;
}

$stmt->bind_param('s', $username);
$stmt->execute();
$stmt->bind_result($cnt);
$stmt->fetch();
$stmt->close();

if( !preg_match('/^[\w_\-]+$/', $username) || !preg_match('/^[\w_\-]+$/', $password)){
	echo json_encode(array(
		"success" => false,
		"message" => "Invalid username or password."
	));
	exit;
} else if($cnt > 0) {
	echo json_encode(array(
		"success" => false,
		"message" => "This username is already taken."
	));
	exit;
}

$hash_pwd = password_hash($password, PASSWORD_DEFAULT);
$stmt = $mysqli->prepare("INSERT into users (username, password) values (?, ?)");
if(!$stmt){
	printf("Query Prep Failed: %s\n", $mysqli->error);
	exit;
}

$stmt->bind_param('ss', $username, $hash_pwd);
$stmt->execute();
$stmt->close();
echo json_encode(array(
	"success" => true
));
exit;

?>