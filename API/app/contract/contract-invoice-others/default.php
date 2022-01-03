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

$Table = array(
    'tax'           => 'taxmaster',
    'kontraktor'    => 'kontraktor'
);

/**
 * Kontraktor
 */
$Q_Data = $DB->Query(
    $Table['kontraktor'],
    array(
        'id',
        'kode',
        'nama'
    ),
    "
        ORDER BY
            nama
    "
);
$R_Data = $DB->Row($Q_Data);

if($R_Data > 0) {

    while($Data = $DB->Result($Q_Data)) {
        $return['kontraktor'][] = $Data;
    }
}
//=> END : Kontraktor

/**
 * Tax Master - PPh
 */
$Q_PPh = $DB->Query(
    $Table['tax'],
    array(),
    "
        WHERE
            status = 1 AND 
            tipe = 1
    "
);
$R_PPh = $DB->Row($Q_PPh);
if($R_PPh > 0){
    while($PPh = $DB->Result($Q_PPh)){
        $return['pph'][] = $PPh;
    }
}
//=> / END : Tax Master - PPh

/**
 * Extract Cur
 */
$Q_Cur = $DB->Query(
    'cur',
    array(
        'id',
        'kode',
        'nama',
        'country'
    ),
    "
        WHERE
            status != 0
        ORDER BY
            id ASC
    "
);
$R_Cur = $DB->Row($Q_Cur);

if($R_Cur > 0){

    $i = 0;
    while($Cur = $DB->Result($Q_Cur)){
        $return['currency'][$i] = $Cur;
        $i++;
    }
}
//=> / END : Extract Cur

echo Core::ReturnData($return);
?>