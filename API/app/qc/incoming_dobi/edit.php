<?php

$Modid = 125;
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
    'def'           => 'qc_dobi',
    'wbtrx'         => 'wb_transaksi'
);

$start_time = substr($start_time, 0, 2) . ":" . substr($start_time, -2) . ":00";
$end_time = substr($end_time, 0, 2) . ":" . substr($end_time, -2) . ":59";

/**
 * Check Data in Period Time
 */
$Check = $DB->Row($DB->Query(
    $Table['def'],
    array('id'),
    "
        WHERE
            start_date >= '" . $start_date . "' AND 
            start_time >= '" . $start_time . "' AND 
            end_date <= '" . $end_date . "' AND 
            end_time <= '" . $end_time . "' AND 
            pks = '" . $pks . "' AND 
            id != '" . $id . "'
    "
));
if ($Check > 0) {

    $return = array(
        'status' => 0,
        'error_msg' => 'Data on Periode Time you select already exists'
    );
    echo Core::ReturnData($return);
    exit();
}
//=> / END : Check Data in Period Time

$Field = array(
    'start_date' => $start_date,
    'start_time' => $start_time,
    'end_date' => $end_date,
    'end_time' => $end_time,
    'pks' => $pks,
    'dobi' => $dobi,
    'update_by' => Core::GetState('id'),
    'update_date' => date('Y-m-d H:i:s')
);

$DB->ManualCommit();

/**
 * Insert Data
 */
if ($DB->Update(
    $Table['def'],
    $Field,
    "id = '" . $id . "'"
)) {

    /**
     * Update Dobi on wb_transaksi in priode time
     */
    $FieldUpdate = array(
        'dobi_qc' => $dobi
    );
    $ClauseUpdate = "
        create_date >= '" . $start_date . " " . $start_time . "' AND 
        create_date <= '" . $end_date . " " . $end_time . "' AND 
        pks = '" . $pks . "'
    ";
    //=> / END : Update Dobi on wb_transaksi in priode time

    if ($DB->Update(
        $Table['wbtrx'],
        $FieldUpdate,
        $ClauseUpdate
    )) {
        $DB->Commit();

        $return['status'] = 1;
    } else {
        $return = array(
            'status'    => 0,
            'error_msg' => 'Failed to update Dobi Data on Weighbridge Transactions'
        );
    }
} else {
    $return = array(
        'status'    => 0,
        'error_msg' => $GLOBALS['mysql']->error
    );
}
//=> / END : Insert Data

echo Core::ReturnData($return);

?>