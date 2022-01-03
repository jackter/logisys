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
    'coa'      => 'coa_master'
);

//=> Company
include "app/_global/company.php";

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