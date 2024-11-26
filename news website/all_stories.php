<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>All Stories</title>
    <link rel="stylesheet" href="style.css" >
</head>
<body>
    
    <h1>Search Story</h1>
    <form action="search_story.php" method="GET">
        <label>Search: <input type="text" name="search" required></label><br><br>
        <input type="submit" value="Search">
    </form>

    <h1>List of All Stories</h1>
    
    <?php
    //referenced from CSE330 Wiki
    session_start();
    require 'database.php';

    if (isset($_SESSION['username'])) {
        echo '<a href="userhome.php">Go back to your homepage</a>';
    } else {
        echo '<a href="firstpage.html">Go back to login page</a>';
    }

    $stmt = $mysqli->prepare("select username, title, story_id from stories");
    if(!$stmt){
        printf("Query Prep Failed: %s\n", $mysqli->error);
        exit;
    }

    $stmt->execute();

    $result = $stmt->get_result();
    echo "<ul>\n";
    while($row = $result->fetch_assoc()){
        $title = htmlspecialchars($row["title"]);
        $username = htmlspecialchars($row["username"]);
        $story_id = htmlspecialchars($row["story_id"]);
        echo "<h2>".$title."</h2>";
        echo "<p><strong>by ". $username."</strong></p>";
        echo '<a href="view_story.php?story_id='.$story_id.'">View the story.</a>';
        echo "<hr>";
    }
    echo "</ul>\n";

    $stmt->close();
    ?>

</body>
</html>