<?php
$Modid = 71;

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
    'def'       => 'customer'
);

/**
 * Get Data
 */
$Q_Data = $DB->Query(
    $Table['def'],
    array(
        'id',
        'kode',
        'jenis',
        'nama',
        'abbr',
        'alamat',
        'kabkota',
        'provinsi',
        'cp',
        'cp_telp1',
        'cp_telp2',
        'cp_hp1',
        'cp_hp2',
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
    $return['data']['alamat'] = str_replace("\\n", "\n", $Data['alamat']);;
}
//=> / END : Get Data

echo Core::ReturnData($return);
?>