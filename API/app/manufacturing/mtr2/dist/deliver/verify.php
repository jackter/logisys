<?php
$Modid = 195;
Perm::Check($Modid, 'verify_deliver');

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
    'def'       => 'prd_issued'
);

/**
 * Update Verify
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
    'table'         => $Table['def'],
    'clause'        => "WHERE id = '" . $id . "'",
    'action'        => "verify_deliver",
    'description'   => "Verify Deliver " . $kode
);
$History = Core::History($HistoryField);

$Field = array(
    'verified'       => 1,
    'verified_by'    => Core::GetState('id'),
    'verified_date'  => $Date,
    'update_by'      => Core::GetState('id'),
    'update_date'    => $Date,
    'history'        => $History
);
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