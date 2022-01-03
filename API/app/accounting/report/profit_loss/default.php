<?php
$Modid = 128;

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

$ProfitLoss = Core::GetParams(array('profit_loss_tree'));
$return['tree'] = $ProfitLoss['profit_loss_tree']['value'];

$return['permissions'] = Perm::Extract($Modid);

echo Core::ReturnData($return);
?>