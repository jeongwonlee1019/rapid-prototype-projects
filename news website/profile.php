<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Profile</title>
    <link rel="stylesheet" href="style.css" >
</head>
<body>
    <h1>Home</h1>

    <?php
    session_start();
    require 'database.php';
    $username = $_SESSION['username'];
    echo "<h2>".$username."'s Profile</h2><br><br>";

    // stories
    $stmt = $mysqli->prepare("select title, body, link, story_id from stories where username = ?");
    if(!$stmt) {
        printf("Query Prep Failed: %s\n", $mysqli->error);
        exit;
    }
    $stmt->bind_param('s', $username);
    $stmt->execute();
    $stmt->bind_result($title, $body, $link, $story_id);
    echo "<h2>Your Stories</h2>";
    while($stmt->fetch()){
        echo "<h3>".$title."</h3>";
        echo "<p>".$body."</p>";
        if($link != null){
            echo "<a href=$link> Click to see the attached link. </a><br>";
        }
        echo '<a href="view_story.php?story_id='.$story_id.'">View the story.</a>';
        echo "<hr>";
    }
    $stmt->close();

    // comments
    $stmt = $mysqli->prepare("SELECT stories.title, stories.username, comments.comment, stories.story_id FROM comments JOIN stories ON comments.story_id = stories.story_id WHERE comments.username = ?");
    if(!$stmt) {
    printf("Query Prep Failed: %s\n", $mysqli->error);
    exit;
    }
    $stmt->bind_param('s', $username);
    $stmt->execute();
    $stmt->bind_result($title, $author, $comment, $story_id);

    echo "<h2>Your Comments</h2>";
    while($stmt->fetch()){
    echo "<p>Comment: ".$comment."</p>";
    echo "<p>On Story: ".$title." by ".$author."</p><br>";
    echo '<a href="view_story.php?story_id='.$story_id.'">View the story.</a><br>';
    }
    $stmt->close();

    ?>
</body>
</html>