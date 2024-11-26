<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Home</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <h1>Home</h1>

    <?php
    session_start();
    require 'database.php';
    $username = $_SESSION['username'];
    echo "<h2>Logged in as ".$username."</h2>";
    ?>

    <h2>Submit a Story</h2>
    <form action="submit_story.php" method="POST">
        <label>Title:<input type="text" name="title" required><br>
        </label><br>
        <label>Body: <textarea name="body" rows="10" cols="80" style="vertical-align: top;"></textarea><br>
        </label><br>
        <label>Link:<input type="text" name="link" placeholder="Optional"><br>
        </label><br>
        <input type="hidden" name="token" value="<?php echo $_SESSION['token']; ?>">
        <input type="submit" value="Submit">
    </form>
    <hr>

    <h2>View Your Profile</h2>
    <a href="profile.php">Click here to view your profile.</a>
    <hr>

    <h2>View All Stories</h2>
    <a href="all_stories.php">Click here to view all stories.</a>
    <hr>

    <h2>Logout</h2>
    <form action="logout.php" method="POST">
        <input type="submit" value="Logout"/>
    </form>
</body>
</html>