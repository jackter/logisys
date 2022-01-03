<?php
$Modid  = 130;

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

$return['permissions'] = Perm::Extract($Modid);

//=> Company
include "app/_global/company.instore.stock.php";

/**
 * Parameter
 */
$Q_Parameter = $DB->Query(
    "parameter",
    array(
        'param_val'
    ),
    "
        WHERE
            id = 'day_subtract'
    "
);
$R_Parameter = $DB->Row($Q_Parameter);
if($R_Parameter > 0){
    $Parameter = $DB->Result($Q_Parameter);

    $return['day_subs'] = $Parameter['param_val'];
}
//=> End Parameter

echo Core::ReturnData($return);
?>