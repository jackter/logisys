<?php

$Modid = 31;
Perm::Check($Modid, 'close_pq');

//=> Default Statement
$return = [];
$RPL    = "";
$SENT    = Core::Extract($_POST, $RPL);

//=> Extract Array
if (isset($SENT)) {
    foreach ($SENT as $KEY => $VAL) {
        $$KEY = $VAL;
    }
}

$Table = array(
    'def'   => 'pq'
);

# History
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
    'table'            => $Table['def'],
    'clause'        => "WHERE id = '" . $id . "'",
    'action'        => "close_pq",
    'description'    => "Close (" . $kode . ")"
);
$History = Core::History($HistoryField);

# Field
$Field = array(
    'is_close'      => 1,
    'close_remarks' => $close_remarks,
    'update_by'     => Core::GetState('id'),
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

echo Core::ReturnData($return);

?>