<?php
$Modid = 185;

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
    'def'       => 'pihakketiga_coa'
);

$CLAUSE = "";

$CLAUSE .= "
    AND company = '" . $company . "'
";

/**
 * Get Data
 */
$Q_Data = $DB->Query(
    $Table['def'],
    array(
        'id',
        'pihakketiga_tipe',
        'pihakketiga',
        'pihakketiga_kode',
        'pihakketiga_nama',
        'coa',
        'coa_kode',
        'coa_nama',
        'coa_accrued',
        'coa_kode_accrued',
        'coa_nama_accrued',
    ),
    "
        WHERE 
            pihakketiga_tipe = 1
            AND pihakketiga = '" . $id . "'
            $CLAUSE
    "
);
$R_Data = $DB->Row($Q_Data);
if($R_Data > 0){
    $Data = $DB->Result($Q_Data);

    $return['data'] = $Data;
}
//=> / END : Get Data

echo Core::ReturnData($return);
?>