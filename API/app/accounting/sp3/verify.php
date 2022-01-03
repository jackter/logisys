<?php

$Modid = 109;
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
    'def'       => 'sp3'
);

/**
 * Update Verify
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
    'table'            => $Table['def'],
    'clause'        => "WHERE id = '" . $id . "'",
    'action'        => "verify",
    'description'    => "Verify SP3 " . $kode
);
$History = Core::History($HistoryField);

$Field = array(
    'verified'      => 1,
    'verified_by'   => Core::GetState('id'),
    'verified_date'    => $Date,
    'update_by'        => Core::GetState('id'),
    'update_date'    => $Date,
    'history'        => $History
);

$DB->ManualCommit();

if ($DB->Update(
    $Table['def'],
    $Field,
    "id = '" . $id . "'"
)) {

    $Date = date("Y-m-d H:i:s");

    $HistoryField = array(
        'table'            => $Table['def'],
        'clause'        => "WHERE id = '" . $id . "'",
        'action'        => "verify",
        'description'    => "Print P3 " . $kode
    );
    $History = Core::History($HistoryField);

    $Field = array(
        'print_status'  => 1,
        'verified'      => 1,
        'verified_by'   => Core::GetState('id'),
        'verified_date'    => $Date,
        'history'        => $History
    );

    if ($DB->Update(
        $Table['def'],
        $Field,
        "id = '" . $id . "'"
    )) {
        $DB->UpdateOn(
            DB['recon'],
            $Table['def'],
            array(
                'print_status'  => 1
            ),
            "kode = '" . $kode . "'"
        );
    }

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