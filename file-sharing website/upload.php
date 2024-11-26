<?php
session_start();

$filename = basename($_FILES['uploadedfile']['name']);
if( !preg_match('/^[\w_\.\-]+$/', $filename) ){
	echo "Invalid filename";
	exit;
}

$username = $_SESSION['username'];
if( !preg_match('/^[\w_\-]+$/', $username) ){
	echo "Invalid username";
	exit;
}

$full_path = sprintf("/srv/module2group/%s/%s", $username, $filename); //root should be changed !!!

if( move_uploaded_file($_FILES['uploadedfile']['tmp_name'], $full_path) ){
    echo "Your file is successfully uploaded. Please go back to the previous page and check your new file.";
	exit;
}else{
    echo "Your file is failed to upload. Please go back to the previous page and try again.";
	exit;
}
?>