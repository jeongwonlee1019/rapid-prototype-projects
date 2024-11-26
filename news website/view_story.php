<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>View Story</title>
    <link rel="stylesheet" href="style.css" >
</head>
<body>
    <?php
        session_start();
        require "database.php";

        echo '<a href="all_stories.php"><- Go back to view all stories</a>';
        
        $story_id = $_GET['story_id'];

        $stmt = $mysqli->prepare("select username, title, body, link from stories where story_id =  ?");
        if(!$stmt){
            printf("Query Prep Failed: %s\n", $mysqli->error);
            exit;
        }

        $stmt->bind_param('i', $story_id);
        $stmt->execute();

        $stmt->bind_result($username, $title, $body, $link);
        $stmt->fetch();
        $stmt->close();
        //display the story
        echo "<h2>Title: ".$title. "</h2>";
        echo "<p><strong>by ".$username."</strong></p>";
        echo "<p>".$body."</p>";
        if($link != null){
            echo "<a href=$link>Click to see the attached link.</a><br>";
        }

        //Edit or Delete Stories
        if(isset($_SESSION['username'])) {
            if($_SESSION['username'] == $username){
                echo '<form action="edit_story_page.php" method="POST">
                <input type="hidden" name="token" value="'.$_SESSION['token'].'">
                <input type="hidden" name="story_id" value="'.$story_id.'">
                <input type="submit" value="Edit Story"> </form>';

                echo '<form action="delete_story.php" method="POST">
                <input type="hidden" name="token" value="'.$_SESSION['token'].'">
                <input type="hidden" name="story_id" value="'.$story_id.'">
                <input type="submit" value="Delete Story"> </form><br>';
            }
        }
        
        //display comments
        echo "<h2>Comments</h2>";
        $stmt = $mysqli->prepare("select username, comment, comment_id from comments where story_id =  ?");
        if(!$stmt){
            printf("Query Prep Failed: %s\n", $mysqli->error);
            exit;
        }

        $stmt->bind_param('i', $story_id);
        $stmt->execute();

        $result = $stmt->get_result();
        echo "<ul>\n";
        //display comments and edit/delete buttons
        while($row = $result->fetch_assoc()){
            echo "<p>".$row["username"].": ".$row['comment']."</p>";
            if(isset($_SESSION['username'])) {
                if($_SESSION['username'] == $row["username"]){
                    echo '<form action="edit_comment_page.php" method="POST">
                    <input type="hidden" name="token" value="'.$_SESSION['token'].'">
                    <input type="hidden" name="comment_id" value="'.$row['comment_id'].'">
                    <input type="hidden" name="story_id" value="'.$story_id.'">
                    <input type="submit" value="Edit Comment"> </form>';

                    echo '<form action="delete_comment.php" method="POST">
                    <input type="hidden" name="token" value="'.$_SESSION['token'].'">
                    <input type="hidden" name="comment_id" value="'.$row['comment_id'].'">
                    <input type="hidden" name="story_id" value="'.$story_id.'">
                    <input type="submit" value="Delete Comment"> </form>';            } 
                }    
            }
        echo "</ul>\n";

        //Write comments
        if(isset($_SESSION['username'])) {
            if(isset($_SESSION['username'])){
                echo '<form action="comment.php" method="POST">
                <label>
                Write Your Comment: <input type="text" name="comment">
                </label>
                <input type="hidden" name="token" value="'.$_SESSION['token'].'">
                <input type="hidden" name="story_id" value="'.$story_id.'">
                <input type="submit" value="Submit">
                </form>';
            } else {
                echo "You need to log in to comment.<br>";
                echo '<a href="firstpage.html">Back to First Page.</a>';
            }
        }

        $stmt->close();      
    ?>
</body>
</html>