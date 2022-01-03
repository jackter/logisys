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
    'grup'     => 'item_grup',
    'coa'      => 'coa_master'
);

/**
 * Extract Grup
 */
$Q_Grup = $DB->Query(
    $Table['grup'],
    array(
        'id',
        'kode',
        'nama'
    ),
    "
        WHERE
            status != 0
        ORDER BY
            kode ASC
    "
);
$R_Grup = $DB->Row($Q_Grup);
if($R_Grup > 0){
    while($Grup = $DB->Result($Q_Grup)){
        $return['grup'][] = $Grup;
    }
}
//=> / END : Extract Grup

/**
 * Extract COA
 */
$Q_COA = $DB->Query(
    $Table['coa'],
    array(
        'id',
        'company',
        'kode',
        'nama'
    ),
    "
        WHERE
            status != 0
        ORDER BY
            kode ASC
    "
);
$R_COA = $DB->Row($Q_COA);
if($R_COA > 0){
    while($COA = $DB->Result($Q_COA)){
        $return['coa'][] = $COA;
    }
}
//=> / END : Extract COA

echo Core::ReturnData($return);
?>