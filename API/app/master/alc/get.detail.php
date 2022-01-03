<?php 
$Modid = 132;

Perm::Check($Modid, 'view');

/* Default Statement */
$return = [];
$RPL = "";
$SENT = Core::Extract($_POST, $RPL);

/* Extract Array */
if (isset($SENT)) {
    foreach ($SENT as $KEY => $VAL) {
        $$KEY = $VAL;
    }
}

$Table = array(
    'def'           =>  'trx_type',
    'coa'           => 'coa_master'
);

$CLAUSE = "";

//=> Company
include "app/_global/company.php";

/**
 * Get Data
 */
$Q_Data = $DB->Query(
    $Table['def'],
    array(
        'id',
        'doc_source',
        'doc_nama'
    ),
    "
        $CLAUSE
        ORDER BY
            doc_source, doc_nama ASC
        LIMIT
            100
    "
);
$R_Data = $DB->Row($Q_Data);
if($R_Data > 0){

    $i = 0;
    while($Data = $DB->Result($Q_Data)){

        $return['trx_type'][$i] = $Data;

        $i++;
    }
}
//=> / END : Get Data

/**
 * Get COA
 */
$Q_COA = $DB->Query(
    $Table['coa'],
    array(
        'id',
        'kode',
        'nama',
        'company'
    ),
    "
        WHERE
            company = '" . $company . "' AND
            is_h = 0 AND
            status = 1
        ORDER BY
            kode
    "
);
$R_COA = $DB->Row($Q_COA);

if($R_COA > 0) {
    
    $i = 0;
    while($COA = $DB->Result($Q_COA)) {

        $return['coa'][$i] = $COA;
        $i++;
    }
}
//=> / END : Get COA

$Params = Core::GetParams(array(
    'alokasi_coa'
));
$return['params'] = $Params;

echo Core::ReturnData($return);

?>