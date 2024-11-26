<?php
	require 'database.php';

	$username = $mysqli->real_escape_string($_POST['username']);
	$password = $_POST['password'];
    $question = $_POST['question'];

    if(strlen($username) > 30) {
        echo "Your username is too long.";
        exit;
    }
    if(strlen($password) > 30) {
        echo "Your password is too long.";
        exit;
    }
    if(strlen($question) > 150) {
        echo "Your security question is too long.";
        exit;
    }
    
    $stmt = $mysqli->prepare("select count(*) from users where username=?");
    if(!$stmt){
        printf("Query Prep Failed: %s\n", $mysqli->error);
        exit;
    }
    $stmt->bind_param('s', $username);
    $stmt->execute();
    $stmt->bind_result($count);
    $stmt->fetch();
    $stmt->close();

	if( !preg_match('/^[\w_\-]+$/', $username) || !preg_match('/^[\w_\-]+$/', $password) || !preg_match('/^[\w_\-]+$/', $question)){
        echo "Invalid username, password, or security question.";
        exit;
    } else if($count > 0) {
        echo "This username is already taken.";
        exit;
    }

    $hash_pwd = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $mysqli->prepare("insert into users(username, password, security_question) values (?,?,?)");
	if(!$stmt){
		printf("Query Prep Failed: %s\n", $mysqli->error);
		exit;
	}

	$stmt->bind_param('sss', $username, $hash_pwd, $question);
	$stmt->execute();
	$stmt->close();
	header("Location:registersuccess.html");
?>
