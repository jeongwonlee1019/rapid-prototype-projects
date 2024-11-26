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

$finfo = new finfo(FILEINFO_MIME_TYPE);
$mime = $finfo->file($full_path);

header("Content-Type: ".$mime);
header('content-disposition: inline; filename="'.$filename.'";');
readfile($full_path);
?>