<?php
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

//=> Company
include "app/_global/company.php";

$Params = Core::GetParams(array(
    'alokasi_coa'
));
$return['params'] = $Params;

echo Core::ReturnData($return);
?>