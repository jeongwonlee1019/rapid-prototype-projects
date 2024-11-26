<?php
session_start();
$filename = $_GET['fileName'];

if( !preg_match('/^[\w_\.\-]+$/', $filename) ){
	echo "Invalid filename";
	exit;
}

$username = $_SESSION['username'];
if( !preg_match('/^[\w_\-]+$/', $username) ){
	echo "Invalid username";
	exit;
}

$full_path = sprintf("/srv/module2group/%s/%s", $username, $filename);

if(file_exists($full_path) == false){
    echo "File does not exist in your file list.";
    exit;
}

if(unlink($full_path)){
    echo "Your file is successfully deleted. Please go back to the previous page to check your updated file list.";
}
else{
    echo "Your file is failed to delete. Please go back to the previous page and try again.";
}

?>