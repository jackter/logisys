<?php

$Modid = 72;
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
    'def'       => 'sales_invoice',
    'sc'        => 'kontrak'
);

$DB->ManualCommit();

$DB->Update(
    $Table['sc'],
    array(
        'invoice_status' => 0
    ),
    "
        id = '" . $sc . "'
    "
);

if ($DB->Delete(
    $Table['def'],
    "
        id = '" . $id . "'
    "
)) {
    $DB->Commit();
    $return['status'] = 1;
} else {
    $return = array(
        'status'        => 0,
        'error_msg'     => "Cannot Delete Processed Sales Invoice Down Payment"
    );
}

echo Core::ReturnData($return);

?>