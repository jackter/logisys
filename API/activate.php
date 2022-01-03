<?php
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

$Modid = $ses;
$Check = Perm::Count($Modid);

if($Check > 0){
    $return['status'] = "online";
}else{
    $return['status'] = "offline";
}

echo Core::ReturnData($return);
?>