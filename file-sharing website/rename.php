<?php

session_start();
$username = $_SESSION["username"]; 
$currentName = $_POST['current_name'];
$newName = $_POST['new_name'];

if (empty($newName) || !preg_match('/^[\w_\.\-]+$/', $newName)) {
    echo "Invalid file name.";
    exit;
}

$currentFilePath = sprintf("/srv/module2group/%s/%s", $username,$currentName);
$newFilePath = sprintf("/srv/module2group/%s/%s", $username, $newName);

if (!file_exists($currentFilePath)) {
    echo "The file doesn't exist.";
    exit;
}

if (file_exists($newFilePath)) {
    echo "A file with that name already exists. Please choose another name.";
    exit;
}

if (rename($currentFilePath, $newFilePath)) {
    echo "File renamed successfully.";
} else {
    echo "Failed to rename the file.";
}

?>