<?php
$Key = "LogisysSyncServer";

$Content = explode(";", $_SERVER["CONTENT_TYPE"]);
$Content = base64_decode(base64_decode($Content[1]));
$Content = explode(";", $Content);
$Content = $Content[0];

if($Content == $Key){
    $Data = array(
        'test'  => 'ok',
        'time'  => date('Y-m-d H:i:s')
    );

    echo json_encode($Data);
}
?>