<?php

$Modid = 79;
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
    'def'       => 'wb_vehicle'
);

$DB->ManualCommit();

if ($DB->Delete(
    $Table['def'],
    "id = '" . $id . "'",
    array(
        'wbclone'   => true
    )
)) {

    $DB->Update(
        'wb_state',
        array(
            'last_update' => date('Y-m-d H:i:s')
        ),
        "`table` = '" . $Table['def'] . "'"
    );

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