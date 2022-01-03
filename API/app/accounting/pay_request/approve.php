<?php

$Modid = 63;
Perm::Check($Modid, 'approve');

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
 * Update Approve
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
    'table'         => $Table['def'],
    'clause'        => "WHERE id = '" . $id . "'",
    'action'        => "approve",
    'description'   => "Approve Payment Request " . $kode
);
$History = Core::History($HistoryField);

$Field = array(
    'print_status'  => 1,
    'approved'      => 1,
    'approved_by'   => Core::GetState('id'),
    'approved_date' => $Date,
    'history'       => $History
);

$DB->ManualCommit();

$list = json_decode($list, true);

if ($DB->Update(
    $Table['def'],
    $Field,
    "id = '" . $id . "'"
)) {

    $P3 = $DB->Result($DB->Query(
        $Table['def'],
        array(
            'kode'
        ),
        "
            WHERE
                id = '" . $id . "'
        "
    ));

    $DB->UpdateOn(
        DB['recon'],
        $Table['def'],
        array(
            'print_status'  => 1
        ),
        "kode = '" . $kode . "'"
    );

    $DB->Commit();

    $return['status'] = 1;
    $return['id'] = $id;
} else {
    $return = array(
        'status'    => 0,
        'error_msg' => $GLOBALS['mysql']->error
    );
}
// => / END: Update Approve

echo Core::ReturnData($return);

?>