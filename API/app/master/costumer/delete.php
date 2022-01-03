<?php
$Modid = 71;

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
    'def'       => 'customer'
);

if($DB->Delete($Table['def'], "id = '" . $id . "'")){
    $return['status'] = 1;
}else{
    $return = array(
        'status'        => 0,
        'error_msg'     => $GLOBALS['mysql']->error
    );
}

echo Core::ReturnData($return);
?>