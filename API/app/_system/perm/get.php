<?php
$Modid = 12;

Perm::Check($Modid, 'edit');

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
    'def'       => 'sys_group'
);

$Q_Data = $DB->Query(
    $Table['def'],
    array(
        'id',
        'nama',
        'keterangan'
    ),
    "
        WHERE id = '" . $id . "'
    "
);
$R_Data = $DB->Row($Q_Data);

if($R_Data > 0){

    $return['status']       = 1;
    
    $Data = $DB->Result($Q_Data);

    $return['data'] = array(
        'id'            => $Data['id'],
        'nama'          => $Data['nama'],
        'keterangan'    => $Data['keterangan']
    );
    
}else{

    $return = array(
		'status'		=> 0,
		'error_msg'		=> 'Download Data Error'
	);

}

echo Core::ReturnData($return);
?>