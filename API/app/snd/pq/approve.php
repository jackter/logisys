<?php

$Modid = 31;

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

/**
 * Set Apvd Level
 */
$apvd_lvl = "";
$DESC = "Manager Approve Purchase Request (" . $kode . ")";
if ($lvl == 2) {
    Perm::Check($Modid, 'approve2');
    $apvd_lvl = 2;
    $DESC = "(Dirkom/Head) Approve Purchase Request (" . $kode . ")";
} elseif ($lvl == 3) {
    Perm::Check($Modid, 'approve3');
    $apvd_lvl = 3;
    $DESC = "(CEO) Approve Purchase Request (" . $kode . ")";
} elseif ($lvl == 1) {
    $apvd_lvl = "";
    Perm::Check($Modid, 'approve');
} else {
    echo "Approve Failed";
    exit();
}
//=> / END : Set Apvd Level

/**
 * Set Finish
 */
$is_finish = false;
if ($apvd == $lvl) {
    $is_finish = true;
}
//=> / END : Set Finish

$Table = array(
    'def'  => 'pq'
);

/**
 * Update Approve
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
    'table'         => $Table['def'],
    'clause'        => "WHERE id = '" . $id . "'",
    'action'        => "approve" . $apvd_lvl,
    'description'   => $DESC
);
$History = Core::History($HistoryField);

$Field = array(
    'approved' . $apvd_lvl           => 1,
    'approved' . $apvd_lvl . '_by'   => Core::GetState('id'),
    'approved' . $apvd_lvl . '_date' => $Date,
    'history'                        => $History
);

if ($is_finish) {
    $Field['finish'] = 1;
    $Field['finish_date'] = $Date;
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