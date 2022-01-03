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

$Params = Core::GetParams(array(
    'sales_invoice'
));
$return['params'] = $Params;

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

/**
 * Bank
 */
$Q_BANK = $DB->QueryPort("
    SELECT
        cb.id,
        b.nama nama_bank,
        cb.no_rekening,
        cb.nama_rekening,
        cb.company
    FROM 
        company_bank cb, bank b
    WHERE 
        cb.bank = b.id
    ORDER BY 
        cb.company, b.nama, cb.no_rekening
");
$R_BANK = $DB->Row($Q_BANK);
if ($R_BANK > 0) {
    $i = 0;
    while ($BANK = $DB->Result($Q_BANK)) {

        $return['bank'][$i] = $BANK;

        $i++;
    }
}
//End => Bank

echo Core::ReturnData($return);
?>