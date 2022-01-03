<?php
$Modid = 111;

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
    'def'       => 'trx_coa_balance'
);

/**
 * Get Data
 */
$Q_Data = $DB->Query(
    $Table['def'],
    array(
        'id',
        'company',
        'company_abbr',
        'company_nama',
        'coa',
        'coa_kode',
        'coa_nama',
        'doc_id',
        'doc_nama',
        'doc_source',
        'keterangan' => 'remarks',
        'seq'
    ),
    "
        WHERE id = '" . $id . "'
    "
);
$R_Data = $DB->Row($Q_Data);
if($R_Data > 0){

    $Data = $DB->Result($Q_Data);

    $return['data'] = $Data;
    $return['data']['doc_name'] = $Data['doc_source'] . ' - ' . $Data['doc_nama'];
    $return['data']['account'] = $Data['coa_nama'] . ' - ' . $Data['coa_kode'];

}

echo Core::ReturnData($return);
?>