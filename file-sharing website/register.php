<?php
$user = $_POST['username'];
if( !preg_match('/^[\w_\-]+$/', $user) ){
    echo "Invalid username";
    exit;
}

$userList = fopen("/srv/users.txt", "r");
while (!feof($userList)) {
    $listedUser = trim(fgets($userList));

    if (trim($user) == $listedUser) {
        echo "User is already registered on the webpage.";
        exit;
    }
}
fclose($userList);

if ($userList = fopen('/srv/users.txt', 'a')) {
    fwrite($userList, "\n".$user);
    fclose($userList);

    chdir('/srv/module2group');
    mkdir($user);

    echo "User is successfully registered. You can go back to the login page and try to login.";
    exit;
} else {
    echo "You are failed to register. Please go back to the previous page and try again.";
}
?>