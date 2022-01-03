<?php

$Modid = 25;
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
    'def'           => 'storeloc',
    'kategori'      => 'storeloc_kategori'
);

/**
 * Field
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
    'table'            => $Table['def'],
    'clause'        => "WHERE id = '" . $id . "'",
    'action'        => "edit",
    'description'    => "Edit Store Location"
);
$History = Core::History($HistoryField);
$Field = array(
    'sounding'      => $sounding,
    'produk'        => $product,
    'kapasitas'     => $kapasitas,
    'meja_ukur'     => $meja_ukur,
    'suhu'          => $suhu,
    'nama'          => $nama,
    'declaration'   => $declaration,
    'update_by'        => Core::GetState('id'),
    'update_date'    => $Date,
    'history'        => $History
);
//=> / END : Field
$DB->ManualCommit();

/**
 * Update Data
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
//=> / END : Update Data

echo Core::ReturnData($return);

?>