<?php

$Modid = 68;
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
    'def'       => 'kontrak'
);

$DB->ManualCommit();

if ($DB->Delete(
    $Table['def'],
    "
        id = '" . $id . "' AND 
        verified != 1 AND 
        approved != 1
    "
)) {
    $DB->Commit();

    $return['status'] = 1;
} else {
    $return = array(
        'status'        => 0,
        'error_msg'     => "Cannot Delete Contract"
    );
}

echo Core::ReturnData($return);

?>