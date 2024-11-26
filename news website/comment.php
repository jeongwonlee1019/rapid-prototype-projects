<?php
session_start();
require 'database.php';

$username = $_SESSION['username'];
if(!hash_equals($_SESSION['token'], $_POST['token'])){
	die("Request forgery detected");
}

$story_id = $_POST['story_id'];
$comment = $_POST['comment'];
if (empty($comment)) {
    echo "You cannot submit an empty comment.";
    exit;
} 

$stmt = $mysqli->prepare("insert into comments (username, comment, story_id) values (?,?,?)");
if(!$stmt){
    printf("Query Prep Failed: %s\n", $mysqli->error);
    exit;
}

$stmt->bind_param('ssi', $username, $comment, $story_id);
$stmt->execute();
$stmt->close();
header("Location: view_story.php?story_id=".$story_id);
?>