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

    <!-- File list -->
    <?php
    session_start();
    
    $user = $_SESSION['username'];
    $dir = sprintf("/srv/module2group/%s", $user);
    
    echo "<h2>File List of " . $user . ":<br></h2>";

    if ($userDir = opendir($dir)) {
        while (($file=readdir($userDir)) !== false) {
            if ($file == "." || $file == "..") {
                continue;
            } else {
                echo $file . "<br>";
            }
        }
        closedir($userDir);
    }
    ?>

    <!-- View your file -->
    <h2>View your file</h2>
    <form action="view.php" method="GET">
        <label>
            Enter Your File Name (please include the file extension): <input type="text" name="fileName">
        </label>
        <input type="submit" value="View">
    </form>

    <!-- Upload new file -->
    <h2>Upload new file</h2>
    <form enctype="multipart/form-data" action="upload.php" method="POST">
        <p>
            <input type="hidden" name="MAX_FILE_SIZE" value="20000000" />
            <label for="uploadfile_input">Choose a file to upload:</label> <input name="uploadedfile" type="file" id="uploadfile_input" />
        </p>
        <p>
            <input type="submit" value="Upload" />
        </p>
    </form>

    <!-- Delete your file -->
    <h2>Delete your file</h2>
    <form action="delete.php" method="GET">
        <label>
            Enter Your File Name (please include the file extension): <input type="text" name="fileName">
        </label>
        <input type="submit" value="Delete">
    </form>

    <!-- Rename your file -->
    <h2>Rename your file</h2>
    <form action="rename.php" method="POST">
        <label>Enter Your Current File Name (please include the file extension):</label>
        <input type="text" name="current_name"> <br>

        <label>Enter New File Name (please include the file extension):</label>
        <input type="text" name="new_name"> <br>

        <input type="submit" value="Rename">
    </form>

    <!-- Logout -->
     <h2>Logout</h2>
    <form action="logout.php" method="POST">
        <input type="submit" value="Logout"/>
    </form>

</body>
</html>