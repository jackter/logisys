<?php

$Modid = 65;
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
    'def'       => 'transfer_fg',
    'detail'    => 'transfer_fg_detail'
);
$DB->ManualCommit();

if ($DB->Delete(
    $Table['detail'],
    "
        header = '" . $id . "'
    "
)) {
    /**
     * Delete Detail
     */
    if ($DB->Delete(
        $Table['def'],
        "
            id = '" . $id . "'
        "
    )) {

        $return['status_header']['status'] = 1;
    } else {
        $return['status_header'] = array(
            'status'    => 0,
            'error_msg' => $GLOBALS['mysql']->error
        );
    }
    $DB->Commit();

    $return['status'] = 1;
    // => End Delete Detail  

} else {
    $return = array(
        'status'        => 0,
        'error_msg'     => "Cannot Delete Processed"
    );
}

echo Core::ReturnData($return);

?>