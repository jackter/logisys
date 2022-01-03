<?php
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

$ID = Core::GetState('id');
$USERNAME = Core::GetUser('username');

//=> Check Password Match
if($new != $new_confirm){
    $return = array(
        'status'    => 0,
        'error_msg' => 'Password Baru tidak Sama dengan Konfirmasi Password Baru'
    );
    echo Core::ReturnData($return);
    exit();
}

//=> Check Current Password
$OldPass = Core::GenPass($USERNAME, $current);
$Check = $DB->Row($DB->Query(
    'sys_user',
    array('id'),
    "
        WHERE 
            password = '" . $OldPass . "' AND 
            username = '" . $USERNAME . "'
    "
));
if($Check <= 0){
    $return = array(
        'status'    => 0,
        'error_msg' => 'Password yang Anda masukkan salah'
    );
    echo Core::ReturnData($return);
    exit();
}

$GenPass = Core::GenPass($USERNAME, $new);

//=> Update Pass
if($DB->Update(
    'sys_user',
    array(
        'cp'       => 0,
        'password' => $GenPass
    ),
    "id = '" . $ID . "'"
)){
    $return['status'] = 1;
}else{
    $return = array(
        'status'    => 0,
        'error_msg' => 'Password gagal dirubah. Silahkan hubungi admin'
    );
}

echo Core::ReturnData($return);
?>