<?php 
    session_start();
    require 'database.php'; 
    $username = $_SESSION['username'];
    if(!hash_equals($_SESSION['token'], $_POST['token'])) {
        die("Request forgery detected");
    }

    $story_id = $_POST['story_id'];    
    $stmt = $mysqli->prepare("delete from stories where story_id = ?");
    if(!$stmt){
        printf("Query Prep Failed: %s\n", $mysqli->error);
        exit;
    }

    $stmt->bind_param('i', $story_id);
    $stmt->execute();
    $stmt->close();

    header("Location: all_stories.php");
?>
