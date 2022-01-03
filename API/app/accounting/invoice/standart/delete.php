<?php

$Modid = 47;

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
    'def'       => 'invoice',
    'detail'    => 'invoice_expense',
    'gr'        => 'gr',
    'po'        => 'po'
);

$DB->ManualCommit();

$INV = $DB->Result($DB->Query(
    $Table['def'],
    array(
        'id',
        'kode',
        'grn_id'
    ),
    "
        WHERE
            id = '" . $id . "'
    "
));

if($DB->Update(
    $Table['gr'],
    array(
        'inv'       => 0,
        'inv_kode'  => null
    ),
    "
        id IN (".$INV['grn_id'].")
    "
)){
    $DB->Delete(
        $Table['detail'],
        "
            header = '" . $id . "'
        "
    );

    $DB->Delete(
        $Table['def'],
        "
            id = '" . $id . "'
        "
    );

    if($dp_amount > 0){
        $Field = array(
            'dp_invoice_status' => 0
        );
        $DB->Update(
            $Table['po'],
            $Field,
            "
                id = '" . $po . "'
            "
        );
    }

    $DB->Commit();
    $return['status'] = 1;

}else{
    $return = array(
        'status'        => 0,
        'error_msg'     => "Cannot Delete Processed Invoice"
    );
}

echo Core::ReturnData($return);
?>