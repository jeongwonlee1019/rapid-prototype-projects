<?php
    session_start();
    require 'database.php';
    $username = $_SESSION['username'];
    if(!hash_equals($_SESSION['token'], $_POST['token'])) {
        die("Request forgery detected");
    }

    $story_id = $_POST['story_id'];

    $title = $_POST['title'];
    $body = $_POST['body'];
    $link = $_POST['link'];

    if (empty($title)||empty($body)) {
        echo "Title and body are required fields.";
        exit;
    } 

    $title = htmlspecialchars($title, ENT_QUOTES, 'UTF-8');
    $body = htmlspecialchars($body, ENT_QUOTES, 'UTF-8');

    $stmt = $mysqli->prepare("UPDATE stories SET title = ?, body = ?, link = ? WHERE story_id = ?");
    if(!$stmt){
        printf("Query Prep Failed: %s\n", $mysqli->error);
        exit;
    }
    $stmt->bind_param('sssi', $title, $body, $link, $story_id);
    $stmt->execute();
    $stmt->close();

    header("Location: view_story.php?story_id=".$story_id);
    ?>
</body>