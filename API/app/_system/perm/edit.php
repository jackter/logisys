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
    'def'       => 'sys_group',
    'auth'      => 'sys_auth'
);

/**
 * Insert to Sys Group
 * 
 * fungsi yang digunakan untuk memasukkan data ke table sys_group
 */
if($DB->Update(
    $Table['def'],
    array(
        'nama'          => $nama,
        'keterangan'    => $keterangan
    ),
    "id = '" . $id . "'"
)){

    $return['status'] = 1;

}else{
    $return = array(
        'status'        => 0,
        'error_msg'     => 'Gagal Mengedit Group'
    );
}
//=> / END : Insert to Sys Group

echo Core::ReturnData($return);
?>