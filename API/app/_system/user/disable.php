<?php
$Modid = 13;

$Perm = Perm::Check($Modid, 'disable');

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
    'def'       => 'sys_user'
);
if($DB->Update(
    $Table['def'],
    array(
        'status'    => 0
    ),
    "id = '" . $id . "'"
)){
    $return['status'] = 1;
}else{
    $return = array(
		'status'		=> 0,
		'error_msg'		=> "Gagal Update Data!"
	);
}

echo Core::ReturnData($return);
?>