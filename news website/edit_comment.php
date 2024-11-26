<?php
    session_start();
    require 'database.php';
    $username = $_SESSION['username'];
    if(!hash_equals($_SESSION['token'], $_POST['token'])) {
        die("Request forgery detected");
    }

    $comment_id = $_POST['comment_id'];
    $new_comment = $_POST['newcomment'];
    if (empty($new_comment)) {
        echo "You cannot submit an empty comment.";
        exit;
    } 

    $stmt = $mysqli->prepare("update comments set comment = ? where comment_id = ?");
    if(!$stmt){
        printf("Query Prep Failed: %s\n", $mysqli->error);
        exit;
    }
    $stmt->bind_param('si', $new_comment, $comment_id);
    $stmt->execute();
    $stmt->close();

    $story_id = $_POST['story_id'];
    header("Location: view_story.php?story_id=".$story_id);
    ?>
</body>