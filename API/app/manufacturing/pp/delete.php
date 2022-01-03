<?php

$Modid = 108;
Perm::Check($Modid, 'hapus');

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
    'def'       => 'produksi_param'
);
$DB->ManualCommit();

if ($DB->Delete(
    $Table['def'],
    "id = '" . $id . "'"
)) {
    $DB->Commit();

    $return['status'] = 1;
} else {
    $return = array(
        'status'        => 0,
        'error_msg'     => $GLOBALS['mysql']->error
    );
}

echo Core::ReturnData($return);

?>