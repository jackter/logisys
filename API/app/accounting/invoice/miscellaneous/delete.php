<?php
$Modid = 202;
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
    'def'       => 'invoice',
    'expense'   => 'invoice_expense'
);

$DB->ManualCommit();

if ($DB->Delete(
    $Table['expense'],
    "
        header = '" . $id . "'
    "
)) {
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
            'error_msg'     => "Cannot Delete Processed Invoice Miscellaneous"
        );
    }
}

echo Core::ReturnData($return);

?>