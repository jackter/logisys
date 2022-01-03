<?php

$Modid = 195;
Perm::Check($Modid, 'hapus_request');

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
    'def'       => 'prd_mr',
    'detail'    => 'prd_mr_detail'
);

$DB->ManualCommit();

if ($DB->Delete(
    $Table['detail'],
    "
        header = '" . $id . "'
    "
)) {
    if($DB->Delete(
        $Table['def'],
        "
            id = '" . $id . "'
        "
    )) {
        
        $DB->Commit();

        $return['status'] = 1; 
    }
} else {
    $return = array(
        'status'        => 0,
        'error_msg'     => "Cannot Delete Processed"
    );
}

echo Core::ReturnData($return);

?>