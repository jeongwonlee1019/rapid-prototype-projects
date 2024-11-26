<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Forgot Password?</title>
    <link rel="stylesheet" href="style.css" >
</head>
<body>
    <?php
        session_start(); 
        require 'database.php';

        $username = $mysqli->real_escape_string($_POST['username']);
        $newPassword = $_POST['newPassword'];
        $question = $_POST['question'];

        $stmt = $mysqli->prepare("select security_question from users where username=?");
        if(!$stmt){
            printf("Query Prep Failed: %s\n", $mysqli->error);
            exit;
        }
        $stmt->bind_param('s', $username);
        $stmt->execute();
        $stmt->bind_result($securityQuestion);
        $stmt->fetch();
        $stmt->close();

        if( !preg_match('/^[\w_\-]+$/', $username) || !preg_match('/^[\w_\-]+$/', $newPassword) || !preg_match('/^[\w_\-]+$/', $question)){
            echo "Invalid username, security question, or new password";
            exit;
        }

        if ($question == $securityQuestion) {
            $hash_pwd = password_hash($newPassword, PASSWORD_DEFAULT);

            $stmt = $mysqli->prepare("update users set password=? where username=?");
            if(!$stmt){
                printf("Query Prep Failed: %s\n", $mysqli->error);
                exit;
            }

            $stmt->bind_param('ss', $hash_pwd, $username); 
            $stmt->execute();
            $stmt->close();

            echo "Your password is successfully updated.<br>";
            echo '<a href="firstpage.html">Go back to the login page.</a>';
        } else {
            echo "Your password is failed to be updated. Please go back to the previous page and try again.<br>";
            echo '<a href="firstpage.html">Go back to the login page.</a>';
        }
    ?>
</body>
</html>