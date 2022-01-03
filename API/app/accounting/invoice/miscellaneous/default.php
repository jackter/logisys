<?php

$Modid = 202;

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

$return['permissions'] = Perm::Extract($Modid);

/**
 * Currency
 */
$Q_Currency = $DB->Query(
    'cur',
    array(
        'kode',
        'nama'
    ),
    "
        WHERE
            status = 1
    "
);
$R_Currency = $DB->Row($Q_Currency);
if($R_Currency > 0) {
    while($Currency = $DB->Result($Q_Currency)) {
        $return['currency'][] = $Currency;
    }
}
//=> END : Currency

echo Core::ReturnData($return);
?>