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

//=> Company
include "app/_global/company.php";

/**
 * Get Tipe Vehicle
 */
$Q_Data = $DB->Query(
    "vehicle_grup",
    array(
        'id',
        'abbr',
        'nama'
    )
);
$R_Data = $DB->Row($Q_Data);

if($R_Data > 0) {

    while($Data = $DB->Result($Q_Data)) {

        $return['vehicle'][] = $Data; 
    }
}
//=> END : Get Tipe Vehicle

echo Core::ReturnData($return);
?>