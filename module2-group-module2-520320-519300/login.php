<?php
session_start();

$userList = fopen("/srv/users.txt", "r");
$user = $_GET['username'];
if( !preg_match('/^[\w_\-]+$/', $user) ){
    echo "Invalid username";
    exit;
}

while (!feof($userList)) {
    $listedUser = trim(fgets($userList));

    if (trim($user) == $listedUser) {
        $_SESSION['username'] = $user;
        header("Location: home.php");
        fclose($userList);
        exit;
    }
}
echo "The username you typed is not found. Please go back to the previous page and type a valid username.";
fclose($userList);
?>