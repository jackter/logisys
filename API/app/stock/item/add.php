<?php

$Modid = 24;
Perm::Check($Modid, 'add');

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

$global = json_decode($global, true);

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

/**
 * Create Code
 */
$InitialCode = strtoupper($grup_kode);
$Abbr = strtoupper(App::Abbr($nama, 4));
//$CodeFirst = $InitialCode . "-" . $Abbr;
$CodeFirst = $Abbr;

$Len = 4;

$LastKode = $DB->Result($DB->Query(
    $Table['def'],
    array('kode'),
    "
        WHERE
            kode LIKE '" . $CodeFirst . "%'
        ORDER BY
            SUBSTR(kode, -$Len) DESC
    "
));
$LastKode = (int)substr($LastKode['kode'], -$Len) + 1;
$LastKode = str_pad($LastKode, $Len, 0, STR_PAD_LEFT);

$kode = $CodeFirst . $LastKode;
//=> / END : Create Code

$CreateDate = date("Y-m-d H:i:s");

$HistoryField = array(
    'table'         => $Table['def'],
    'clause'        => "WHERE kode = '" . $kode . "'",
    'action'        => "add",
    'description'   => "Added new Item (" . $kode . ")"
);
$History = Core::History($HistoryField);
$Field = array(
    'item_type'     => $item_type,
    'sub_item_type' => $sub_item_type,
    'kode'          => $kode,
    'kode_old'      => $kode_old,
    'nama'          => $nama,
    'grup'          => $grup,
    'grup_nama'     => $grup_nama,
    'satuan'        => $satuan_kode,
    'description'   => $description,
    'create_by'     => Core::GetState('id'),
    'create_date'   => $CreateDate,
    'history'       => $History,
    'status'        => 1
);
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
if ($DB->Insert(
    $Table['def'],
    $Field
)) {

    if (!empty($global['id'])) {
        if (sizeof($global) > 0) {
            if ($DB->UpdateOn(
                DB['master'],
                $Table['master'],
                array(
                    'clone'     => 1
                ),
                "id = '" . $global['id'] . "'"
            )) {
                $return['status_global']['status'] = 1;
            } else {
                $return['status_global'] = array(
                    'status'    => 0,
                    'error_msg' => $GLOBALS['mysql']->error
                );
            }
        }
    }
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