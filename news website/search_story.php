<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Search Story</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <?php
    session_start();
    require 'database.php';

    echo '<a href="all_stories.php">Go back to view all stories</a>';

    $search = '%'.$_GET['search'].'%';

    $stmt = $mysqli->prepare("SELECT title, body, link, username, story_id FROM stories WHERE title LIKE ? OR body LIKE ?");
    if(!$stmt) {
        printf("Query Prep Failed: %s\n", $mysqli->error);
        exit;
    }
    $stmt->bind_param('ss', $search, $search);
    $stmt->execute();
    $stmt->bind_result($title, $body, $link, $author, $story_id);

    echo "<h1>Search Results</h1>";
    while ($stmt->fetch()) {
        echo "<h2>".$title."</h2>";
        echo "<p><strong>by ".$author."</strong></p>";
        echo "<p>".$body."</p>";
        if(!empty($link)){
            echo "<a href='" . htmlspecialchars($link) . "'>Check this link</a><br>";
        }
        echo '<a href="view_story.php?story_id='.$story_id.'">View the story.</a>';
        echo "<hr>";
    }
    $stmt->close();
    ?>
</body>
</html>