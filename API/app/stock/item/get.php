<?php
$Modid = 24;

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
    'def'       => 'item'
);

/**
 * Get Data
 */
$Q_Data = $DB->Query(
    $Table['def'],
    array(
        'id',
        'item_type',
        'sub_item_type',
        'kode',
        'nama2' => 'nama',
        'grup',
        'grup_nama',
        'satuan'        => 'satuan_kode',
        'description',
        'in_decimal',
        'is_advanced',
        'specifications',
        'size',
        'part_no',
        'brand',
        'serial_no',
        'tag_no',
        'is_fix',
        'fix_price',
        'verified'
    ),
    "
        WHERE id = '" . $id . "'
    "
);
$R_Data = $DB->Row($Q_Data);
if($R_Data > 0){
    $Data = $DB->Result($Q_Data);

    $return['data'] = $Data;
    $return['data']['item_type'] = (int)$Data['item_type'];
    $return['data']['sub_item_type'] = (int)$Data['sub_item_type'];

    if($Data['in_decimal'] == 1){
        $return['data']['in_decimal'] = true;
    }else{
        $return['data']['in_decimal'] = false;
    }

    if($Data['is_advanced'] == 1){
        $return['data']['is_advanced'] = true;
    }else{
        $return['data']['is_advanced'] = false;
    }
}
//=> / END : Get Data

echo Core::ReturnData($return);
?>