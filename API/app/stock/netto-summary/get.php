<?php
$Modid = 189;

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
    'def'       => 'netto_summary'
);

/**
 * Get Data
 */
$Q_Data = $DB->Query(
    $Table['def'],
    array(
        'id',
        'tanggal',
        'company',
        'company_abbr',
        'company_nama',
        'tiket_start',
        'tiket_start_kode',
        'tiket_end',
        'tiket_end_kode',
        'item',
        'item_kode',
        'item_nama',
        'item_satuan',
        'total_netto',
        'approved',
        'create_by',
        'create_date'
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
//=> / END : Get Data

echo Core::ReturnData($return);
?>