<?php

$Modid = 83;

Perm::Check($Modid, 'hapus');

//=> Default Statement
$return = [];
$RPL	= "";
$SENT   = Core::Extract($_POST, $RPL);

//=> Extract Array
if(isset($SENT)){
    foreach($SENT as $KEY => $VAL){	
        $$KEY = $VAL;
    }
}

$Table = array(
    'def'   => 'wb_grn',
    'trx'   => 'wb_transaksi'
);

$DB->ManualCommit();

$TRX = $DB->Result($DB->Query(
    $Table['def'],
    array(
        'id',
        'id_trx'
    ),
    "
        WHERE
            id = '".$id."'
    "
));

if($DB->Update(
    $Table['trx'],
    array(
        'grn'   => 0
    ),
    "
        id IN (".$TRX['id_trx'].")
    "
)){

    $DB->Delete(
        $Table['def'],
        "
            id = '" . $id . "'
        "
    );

    $DB->Commit();

    $return['status'] = 1;

}else{
    $return = array(
        'status'        => 0,
        'error_msg'     => "Cannot Delete"
    );
}

echo Core::ReturnData($return);
?>