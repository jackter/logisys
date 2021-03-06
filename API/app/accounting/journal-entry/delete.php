<?php

$Modid = 51;
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
    'def'       => 'jv',
    'detail'    => 'jv_detail'
);

$DB->ManualCommit();

if ($DB->Delete(
    $Table['detail'],
    "header = '" . $id . "'"
)) {

    /**
     * Delete Detail
     */
    if ($DB->Delete(
        $Table['def'],
        "id = '" . $id . "'"
    )) {
        $return['status_header']['status'] = 1;
    } else {
        $return['status_header'] = array(
            'status'    => 0,
            'error_msg' => $GLOBALS['mysql']->error
        );
    }
    // => End Delete Detail  

    $DB->Commit();
    $return['status'] = 1;
} else {
    $return = array(
        'status'        => 0,
        'error_msg'     => "Cannot Delete Processed"
    );
}

echo Core::ReturnData($return);

?>