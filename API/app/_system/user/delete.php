<?php
$Modid = 13;

$Perm = Perm::Check($Modid, 'hapus');

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
if($DB->Delete(
    $Table['def'],
    "id = '" . $id . "'"
)){
    /**
     * Delete user_org
     */
    if($DB->Delete(
        $Table['def'] . "_org", 
        "uid = '" . $id . "'"
    )){
        $return['status'] = 1;
    }
    //=> / END : Delete user_org
}else{
    $return = array(
		'status'		=> 0,
		'error_msg'		=> "Gagal Menghapus Data!"
	);
}

echo Core::ReturnData($return);
?>