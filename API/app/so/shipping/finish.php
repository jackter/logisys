<?php

$Modid = 69;
Perm::Check($Modid, 'finish');

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
    'def'        => 'so'
);

$Date = date("Y-m-d H:i:s");

$HistoryField = array(
    'table'         => "def",
    'clause'        => "WHERE id = '" . $id . "'",
    'action'        => "finish",
    'description'   => "Sales Order Finish " . $kode
);
$History = Core::History($HistoryField);

$Field = array(
    'finish'        => 1,
    'finish_date'   => $Date,
    'update_by'     => Core::GetState('id'),
    'update_date'   => $Date,
    'history'       => $History
);

if ($DB->Update(
    "so",
    $Field,
    "id = '" . $id . "'"
)) {
    $return['status'] = 1;
} else {
    $return = array(
        'status'    => 0,
        'error_msg' => $GLOBALS['mysql']->error
    );
}

echo Core::ReturnData($return);

?>