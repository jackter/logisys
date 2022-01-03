<?php
$Modid = 42;

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
    'def'       => 'supplier'
);

/**
 * Get Data
 */
$Q_Data = $DB->Query(
    $Table['def'],
    array(
        'id',
        'kode',
        'nama',
        'jenis',
        'tipe'  => 'supplier_type',
        'tipe_nama'  => 'supplier_type_nama',
        'alamat',
        'kabkota',
        'provinsi',
        'cp',
        'cp_telp1',
        'cp_telp2',
        'cp_hp1',
        'cp_hp2',
        'website',
        'keterangan',
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