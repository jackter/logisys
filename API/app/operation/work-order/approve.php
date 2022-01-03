<?php

$Modid = 138;
Perm::Check($Modid, 'approve2');

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

/**
 * Update Approve
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
    'table'       => $Table['def'],
    'clause'      => "WHERE id = '" . $id . "'",
    'action'      => "approve",
    'description' => "Work Order Approved"
);
$History = Core::History($HistoryField);

$Field = array(
    'approved2'             => 1,
    'approved2_by'	        => Core::GetState('id'),
	'approved2_date'	    => $Date,
    'history'               => $History
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

echo Core::ReturnData($return);

?>