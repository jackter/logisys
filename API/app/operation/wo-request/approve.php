<?php

$Modid = 192;
// Perm::Check($Modid, 'approve');

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
    'def' => 'wo'
);

$DESC = "";
if($lvl == 1) {
    Perm::Check($Modid, 'approve');
    $DESC = "Superintendent / Manager Approve";
} elseif ($lvl == 2) {
    Perm::Check($Modid, 'gm_approve');
    $DESC = "General Manager Approve";
} else{
    echo "Approve Failed";
    exit();
}

/**
 * Update Approve
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
    'table'       => $Table['def'],
    'clause'      => "WHERE id = '" . $id . "'",
    'action'      => "approve",
    'description' => $DESC
);
$History = Core::History($HistoryField);

if($lvl == 1) {
    $Field = array(
        'approved'          => 1,
        'approved_by'	    => Core::GetState('id'),
        'approved_date'	    => $Date,
        'history'           => $History
    );
} elseif ($lvl == 2) {
    $Field = array(
        'gm_approved'           => 1,
        'gm_approved_by'	    => Core::GetState('id'),
        'gm_approved_date'	    => $Date,
        'history'               => $History
    );
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

echo Core::ReturnData($return);

?>