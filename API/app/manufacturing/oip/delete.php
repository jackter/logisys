<?php

$Modid = 112;
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
    'def'       => 'oip',
    'detail'    => 'oip_detail'
);
$DB->ManualCommit();

if ($DB->Delete(
    $Table['detail'],
    "header = '" . $id . "'"
)) {
    if (
        $DB->Delete(
            $Table['def'],
            "
                id = '" . $id . "' AND 
                verified = 0
            "
        )
    ) {
        $DB->Commit();

        $return['status'] = 1;
    }
} else {
    $return = array(
        'status'        => 0,
        'error_msg'     => "Cannot Delete Processed Oil In Plant"
    );
}

echo Core::ReturnData($return);

?>