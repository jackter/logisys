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

/**
 * Extract COA
 */
$Q_COA = $DB->Query(
    'coa_master',
    array(
        'id',
        'kode',
        'nama'
    ),
    "
        WHERE
            status = 1 AND
            company = '" . $company . "'
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