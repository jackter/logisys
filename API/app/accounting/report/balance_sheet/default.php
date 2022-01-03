<?php
$Modid = 127;

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

//=> Company
include "app/_global/company.php";

$BalanceSheet = Core::GetParams(array('balance_sheet_tree'));
$return['tree'] = $BalanceSheet['balance_sheet_tree']['value'];

$return['permissions'] = Perm::Extract($Modid);

echo Core::ReturnData($return);
?>