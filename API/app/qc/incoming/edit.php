<?php

$Modid = 121;
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
    'def'           => 'wb_transaksi'
);

/**
 * Field
 */
$Date = date("Y-m-d H:i:s");

$Field = array(
    'pks'           => $pks,
    'ffa_qc'        => $ffa_qc,
    'mai_qc'        => $mai_qc,
    // 'dobi_qc'       => $dobi_qc,
    'update_by'     => Core::GetState('id'),
    'update_date'   => $Date
);
//=> / END : Field
$DB->ManualCommit();

/**
 * Update Data
 */
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
//=> / END : Update Data

echo Core::ReturnData($return);

?>