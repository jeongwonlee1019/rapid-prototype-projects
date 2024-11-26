<?php
    session_start();
    require "database.php";
    
    $username = $_SESSION["username"];
    if(!hash_equals($_SESSION['token'], $_POST['token'])){
        die("Request forgery detected");
    }
    
    $title = $_POST['title'];
    $body = $_POST['body'];
    
    if (empty($title)||empty($body)) {
        echo "Title and body are required fields.";
        exit;
    } 

    $link = $_POST['link'];
    $stmt = $mysqli->prepare("insert into stories(username, title, body, link) values (?,?,?,?)");
    if(!$stmt){
        printf("Query Prep Failed: %s\n", $mysqli->error);
        exit;
    }

    $stmt->bind_param("ssss", $username, $title, $body, $link);
    $stmt->execute();
    $stmt->close();
    header("Location:all_stories.php");
?>