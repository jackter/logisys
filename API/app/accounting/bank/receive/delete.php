<?php

$Modid = 118;

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
    'def'       => 'br',
    'detail'    => 'br_detail'
);

$DB->ManualCommit();

if($DB->Delete(
    $Table['detail'],
    "
        header = '" . $id . "'
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
        'error_msg'     => "Cannot Delete Bank Payment"
    );
}

echo Core::ReturnData($return);
?>