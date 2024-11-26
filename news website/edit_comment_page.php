<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Edit Comment</title>
    <link rel="stylesheet" href="style.css" >
</head>
<body>
<?php
    session_start(); 
    $comment_id = $_POST['comment_id']; 
    $story_id = $_POST['story_id']; 
    if(!hash_equals($_SESSION['token'], $_POST['token'])) {
        die("Request forgery detected");
    }
?>
<h1>Edit Your Comment</h1>
    <form action="edit_comment.php" method="POST">
        <label>
            New Comment: <input type="text" name="newcomment" required>
        </label>
        <input type="hidden" name="token" value="<?php echo $_SESSION['token']; ?>">
        <input type="hidden" name="story_id" value="<?php echo $story_id; ?>">
        <input type="hidden" name="comment_id" value="<?php echo $comment_id; ?>">
        <input type="submit" value="Submit">
    </form>
</body>
</html>
