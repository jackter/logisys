<?php
$Modid = 80;

Perm::Check($Modid, 'view');

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
    'def'       => 'company_bank'
);

/**
 * Get Data
 */
$Q_Data = $DB->Query(
    $Table['def'],
    array(
        'id',
        'no_rekening',
        'nama_rekening',
        'bank',
        'bank_kode',
        'bank_nama',
        'coa',
        'coa_kode',
        'coa_nama',
        'currency',
        'company',
        'company_abbr',
        'company_nama',
        'cash',
        'saldo',
        'saldo_minimum'
    ),
    "
        WHERE id = '" . $id . "'
    "
);
$R_Data = $DB->Row($Q_Data);
if($R_Data > 0){

    $Data = $DB->Result($Q_Data);

    $return['data'] = $Data;

}

echo Core::ReturnData($return);
?>