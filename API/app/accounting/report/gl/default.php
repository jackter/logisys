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

$Q_COA = $DB->QueryPort("
    SELECT
        company,
        MIN( kode ) AS coa_kode_from,
        MAX( kode ) AS coa_kode_to 
    FROM
        coa_master 
    WHERE
        company IN ( 2, 3 ) 
    GROUP BY
        company
");
$R_COA = $DB->Row($Q_COA);
if($R_COA > 0) {
    while($COA = $DB->Result($Q_COA)) {
        $return['coa'][] = $COA;
    }
}
echo Core::ReturnData($return);
?>