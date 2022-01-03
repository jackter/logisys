<?php

$Modid = 69;
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
    'def'       => 'shipping'
);

/**
 * Field
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
    'table'         => $Table['def'],
    'clause'        => "WHERE id = '" . $so . "'",
    'action'        => "edit",
    'description'   => "Edit Shipping Instruction " . $kode
);
$History = Core::History($HistoryField);

$Field = array(
    'tanggal'               => $tanggal_send,
    'qty_delivery'          => $qty_delivery,
    'storeloc'              => $storeloc,
    'storeloc_kode'         => $storeloc_kode,
    'storeloc_nama'         => $storeloc_nama,
    'storeloc_grup'         => $storeloc_grup,
    'storeloc_grup_nama'    => $storeloc_grup_nama,
    'remarks'               => CLEANHTML($remarks),
    'update_by'             => Core::GetState('id'),
    'update_date'           => $Date,
    'history'               => $History
);
//=> / END : Field

$DB->ManualCommit();

/**
 * Insert Data
 */
if ($DB->Update(
    $Table['def'],
    $Field,
    "
        id = '" . $id . "'
    "
)) {

    $DB->Commit();

    $return['status'] = 1;
} else {
    $return = array(
        'status'    => 0,
        'error_msg' => $GLOBALS['mysql']->error
    );
}
//=> / END : Insert Data

echo Core::ReturnData($return);

?>