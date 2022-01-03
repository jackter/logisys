<?php

$Modid = 188;
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
    'def'       => 'wb_kontrak_dev',
    'po'        => 'po'
);

$DB->ManualCommit();

if ($DB->Delete(
    $Table['def'],
    "
        id = '" . $id . "'
    "
)) {
    
    $DB->Update(
        'wb_state',
        array(
            'last_update' => date('Y-m-d H:i:s')
        ),
        "`table` = '" . $Table['def'] . "'"
    );
    
    
    
    # Update Table PO
    $Field = array(
        'wb_kontrak'        => NULL,
        'wb_kontrak_kode'   => NULL
    );
    
    $DB->Update(
        $Table['po'],
        $Field,
        "wb_kontrak = '" . $id . "'"
    );
    
    $DB->Commit();
    $return['status'] = 1;
} else {
    $return = array(
        'status'        => 0,
        'error_msg'     => "Cannot Delete Processed Invoice"
    );
}

echo Core::ReturnData($return);

?>