<?php

$Modid = 63;
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
    'def'       => 'sp3',
);

/**
 * Field
 */
$LIST = json_decode($list, true);

$Date = date("Y-m-d H:i:s");

$HistoryField = array(
    'table'         => $Table['def'],
    'clause'        => "WHERE id = '" . $id . "'",
    'action'        => "edit",
    'description'   => "Edit Payment Request " . $kode
);
$History = Core::History($HistoryField);

$Field = array(
    'tanggal'           => $tanggal,
    'keterangan_bayar'  => $payment_note,
    'update_by'         => Core::GetState('id'),
    'update_date'       => $Date,
    'history'           => $History
);
//=> / END : Field

$DB->ManualCommit();

/**
 * Update Data
 */
if ($DB->Update(
    $Table['def'],
    $Field,
    "
        id = '" . $id . "'
    "
)) {
    if ($DB->UpdateOn(
        DB['recon'],
        $Table['def'],
        $Field,
        "
            kode = '" . $kode . "'
        "
    )) {
        $DB->Commit();
        $return['status'] = 1;
    }
} else {
    $return = array(
        'status'    => 0,
        'error_msg' => $GLOBALS['mysql']->error
    );
}
//=> / END : Update Data

echo Core::ReturnData($return);

?>