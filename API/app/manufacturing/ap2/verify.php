<?php

$Modid = 61;
Perm::Check($Modid, 'verify');

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
    'def'       => 'actual_production'
);

$biaya_lain_detail = json_decode($biaya_lain_detail, true);

/**
 * Update Verify
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
    'table'         => $Table['def'],
    'clause'        => "WHERE id = '" . $id . "'",
    'action'        => "verify",
    'description'   => "Verify SR " . $kode
);
$History = Core::History($HistoryField);

$Field = array(
    'biaya_gi'      => $biaya_gi,
    'total_days'    => $total_days,
    'labour'        => $biaya_lain_detail['labour'],
    'laboratory'    => $biaya_lain_detail['laboratory'],
    'engineering'   => $biaya_lain_detail['engineering'],
    'effulent'      => $biaya_lain_detail['effulent'],
    'depreciation'  => $biaya_lain_detail['depreciation'],
    'total_biaya_lain' => $biaya_lain,

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