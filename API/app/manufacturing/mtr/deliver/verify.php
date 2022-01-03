<?php

$Modid = 64;

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

if ($receive_process == 1) {
    Perm::Check($Modid, 'verify_rcv');
} else {
    Perm::Check($Modid, 'verify_deliver');
}

$Table = array(
    'def'       => 'prd_tf_deliver'
);


/**
 * Update Verify
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
    'table'         => $Table['def'],
    'clause'        => "WHERE id = '" . $id . "'",
    'action'        => "verify",
    'description'   => "Verify DTR " . $kode
);
$History = Core::History($HistoryField);

$Field = array(
    'update_by'      => Core::GetState('id'),
    'update_date'    => $Date,
    'history'        => $History
);
if ($receive_process == 1) {
    $Field['verified_rcv'] = 1;
    $Field['verified_by_rcv'] = Core::GetState('id');
    $Field['verified_date_rcv'] = $Date;
} else {
    $Field['verified'] = 1;
    $Field['verified_by'] = Core::GetState('id');
    $Field['verified_date'] = $Date;
}
$DB->ManualCommit();

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
//=> / END: Update Verify

echo Core::ReturnData($return);

?>