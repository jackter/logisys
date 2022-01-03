<?php
$Modid  = 37;

//=> Default Statement
$return = [];
$RPL	= "";
$SENT	= Core::Extract($_POST, $RPL);

//=> Extract Array
if(isset($SENT)){
    foreach($SENT as $KEY => $VAL){	
        $$KEY = $VAL;
    }
}

$Table = array(
    'def'       => 'mr',
);

$return['permissions'] = Perm::Extract($Modid);

//=> Company
include "app/_global/company.instore.stock.php";

echo Core::ReturnData($return);
?>