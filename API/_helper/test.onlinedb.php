<?php
$Config = array(
    'host'      => 'citraborneo.id',
    'user'      => 'citraborneo_indah',
    'pass'      => 'O2D8nKTw_Nda',
    'db'        => 'citraborneo_logisys'
);

$con = mysqli_connect(
    $Config['host'],
    $Config['user'],
    $Config['pass'],
    $Config['db']
);

// Check connection
if (mysqli_connect_errno()){
  echo "Failed to connect to MySQL: " . mysqli_connect_error();
}

echo "Connect Successfully. Host info: " . mysqli_get_host_info($con);
?>