<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Edit Story</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
<?php
    session_start(); 
    $story_id = $_POST['story_id']; 
    if(!hash_equals($_SESSION['token'], $_POST['token'])) {
        die("Request forgery detected");
    }
?>
<h1>Edit Your Story</h1>
    <form action="edit_story.php" method="POST">
        <label>New Title:<input type="text" name="title" required><br>
        </label><br>
        <label>New Body: <textarea name="body" rows="10" cols="80" style="vertical-align: top;"></textarea><br>
        </label><br>
        <label>New Link:<input type="text" name="link" placeholder="Optional"><br>
        </label><br>
        <input type="hidden" name="story_id" value="<?php echo $story_id; ?>">
        <input type="hidden" name="token" value="<?php echo $_SESSION['token']; ?>">
        <input type="submit" value="Submit">
    </form>
</body>
</html>