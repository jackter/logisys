<?php
header('Access-Control-Allow-Origin: *');

$return['status'] = "alive";

echo json_encode($return);
?>