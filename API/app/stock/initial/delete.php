<?php
$Modid = 26;

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
    'def'       => 'initial_stock',
    'detail'    => 'initial_stock_detail'
);

$DB->ManualCommit();

if($DB->Delete(
    $Table['detail'], 
    "header = '" . $id . "'"
)){

    if($DB->Delete(
        $Table['def'], 
        "id = '" . $id . "'"
    )){
        $return['status_header']['status'] = 1;
    }else{
        $return['status_header'] = array(
            'status'    => 0,
            'error_msg' => $GLOBALS['mysql']->error
        );
    }

    $DB->Commit();
    $return['status'] = 1;
}else{
    $return = array(
        'status'        => 0,
        'error_msg'     => $GLOBALS['mysql']->error
    );
}

echo Core::ReturnData($return);

?>