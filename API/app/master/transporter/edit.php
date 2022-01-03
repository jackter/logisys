<?php

$Modid = 206;
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
    'def'           => 'transporter',
);

/**
 * Field
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
    'table'         => $Table['def'],
    'clause'        => "WHERE id = '" . $id . "'",
    'action'        => "edit",
    'description'   => "Edit Data Transporter"
);
$History = Core::History($HistoryField);
$Field = array(
    'nama'          => $nama,
    'jenis'         => $jenis,
    'alamat'        => $alamat,
    'kabkota'       => $kabkota,
    'provinsi'      => $provinsi,
    'cp'            => $cp,
    'cp_telp1'      => $cp_telp1,
    'cp_telp2'      => $cp_telp2,
    'cp_hp1'        => $cp_hp1,
    'cp_hp2'        => $cp_hp2,
    'website'       => $website,
    'keterangan'    => $keterangan,
    'declaration'   => $declaration,
    'update_by'     => Core::GetState('id'),
    'update_date'   => $Date,
    'history'       => $History
);
//=> / END : Field

/**
 * Update Data
 */
if ($DB->Update(
    $Table['def'],
    $Field,
    "id = '" . $id . "'"
)) {

    $return['status'] = 1;
} else {
    $return = array(
        'status'    => 0,
        'error_msg' => $GLOBALS['mysql']->error
    );
}
//=> / END : Update Data

echo Core::ReturnData($return);

?>