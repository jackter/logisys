<?php

$Modid = 64;

if ($receive_process == 1) {
    Perm::Check($Modid, 'approve_rcv');
} else {
    Perm::Check($Modid, 'approve_deliver');
}

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
    'def'       => 'prd_tf_deliver'
);

/**
 * Update Verify
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
    'table'         => $Table['def'],
    'clause'        => "WHERE id = '" . $id . "'",
    'action'        => "reject",
    'description'   => "Reject Request " . $kode
);
$History = Core::History($HistoryField);

$Field = array(
    'update_by'      => Core::GetState('id'),
    'update_date'    => $Date,
    'history'        => $History
);
if ($receive_process == 1) {
    $Field['verified_rcv'] = 0;
} else {
    $Field['verified'] = 0;
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