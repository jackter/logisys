<?php

$Modid = 24;
Perm::Check($Modid, 'edit');

//=> Default Statement
$return = [];
$RPL    = "";
$SENT   = Core::Extract($_POST, $RPL);

//=> Extract Array
if (isset($SENT)) {
    foreach ($SENT as $KEY => $VAL) {
        $$KEY = $VAL;
    }
}

$Table = array(
    'def'           => 'item',
    'master'        => 'item_global'
);

$SmartSatuan = App::SmartSatuan(array(
    'satuan'        => $satuan,
    'satuan_nama'   => $satuan_nama,
    'satuan_kode'   => $satuan_kode
));

$satuan = $SmartSatuan['id'];
$satuan_kode = $SmartSatuan['kode'];

$CreateDate = date("Y-m-d H:i:s");

$HistoryField = array(
    'table'         => $Table['def'],
    'clause'        => "WHERE id = '" . $id . "'",
    'action'        => "edit",
    'description'   => "Edited Item"
);
$History = Core::History($HistoryField);
$nama = stripslashes($nama);
$Field = array(
    'item_type'     => $item_type,
    'sub_item_type' => $sub_item_type,
    'nama'          => $nama,
    'grup'          => $grup,
    'grup_nama'     => $grup_nama,
    'satuan'        => $satuan_kode,
    'description'   => $description,
    'update_by'     => Core::GetState('id'),
    'update_date'   => $CreateDate,
    'history'       => $History
);
$Field['in_decimal'] = 0;
if ($in_decimal) {
    $Field['in_decimal'] = 1;
}
/**
 * is_advanced
 */
$nama2 = $nama;
if ($is_advanced) {
    $Field['is_advanced'] = 1;
    $Field['specifications'] = $specifications;
    $Field['size'] = $size;
    $Field['part_no'] = $part_no;
    $Field['brand'] = ucwords($brand);
    $Field['serial_no'] = $serial_no;
    $Field['tag_no'] = $tag_no;

    /**
     * Generate nama2
     */
    if ($specifications != '') {
        $nama2 .= "; Spec: " . $specifications;
    }
    if ($size != '') {
        $nama2 .= "; Size: " . $size;
    }
    if ($part_no != '') {
        $nama2 .= "; Part No.: " . $part_no;
    }
    if ($brand != '') {
        $nama2 .= "; Brand: " . $brand;
    }
    if ($serial_no != '') {
        $nama2 .= "; Serial: " . $serial_no;
    }
    if ($tag_no != '') {
        $nama2 .= "; Tag No.: " . $tag_no;
    }
    //=> / END : Generate nama2
}
//=> / END : is_advanced

$Field['nama2'] = $nama2;

/**
 * is fix
 */
if ($is_fix) {
    $Field['is_fix'] = 1;
    $Field['fix_price'] = $fix_price;
}
//=> / END : is fix
$DB->ManualCommit();

/**
 * Insert Item
 */
if ($DB->Update(
    $Table['def'],
    $Field,
    "id = '" . $id . "'"
)) {
    $DB->Commit();

    $return['status'] = 1;
} else {
    $return = array(
        'status'    => 0,
        'error_msg' => $GLOBALS['mysql']->error
    );
}
//=> / END : Insert Item

echo Core::ReturnData($return);

?>