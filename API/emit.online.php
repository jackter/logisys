<?php
//sleep(1);
//error_reporting(E_ALL);
//ini_set('display_errors', 'On');
include "config.php";

//=> Default Statement
$return = [];
$RPL	= "";
$SENT	= Core::Extract(cleanpost($_POST), $RPL);

//=> Extract Array
if(isset($SENT)){
    foreach($SENT as $KEY => $VAL){	
        $$KEY = $VAL;
    }
}

include ("vendor/autoload.php");

use ElephantIO\Client;
use ElephantIO\Engine\SocketIO\Version2X;

$Options = array(
    'context'   => array(
        'ssl'   => array(
            'verify_peer_name' => false, 
            'verify_peer' => false
        )
    )
);

$version = new Version2X("https://apps.citraborneo.co.id:62543", $Options);
$client = new Client($version);

$Data =  array(
    'data'  => json_decode($data, true),
    'by'    => Core::GetUser('nama'),
    'from'  => $_SERVER['REMOTE_ADDR']
);

$client->Initialize();
$client->emit('get', $Data);
$client->close();

echo json_encode([]);
?>