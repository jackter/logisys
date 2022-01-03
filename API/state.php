<?php
require_once ("config.php");

if(!checkacs(600)){
	erroracs();
}

$TimeLogin = LOGINTIME * 60;
//$TimeLogin = 10;

$State = Core::GetState();

$ReturnState['status'] = 0;
$Expire = date('Y-m-d H:i:s', time() + $TimeLogin);

//=> Check State
//-- Check Username
/*$Q_User = DB_QUERY("sys_user", "WHERE id = '" . $State->id . "' AND username = '" . $State->username . "'");
$R_User = DB_ROWS($Q_User);
$User = DB_RESULT($Q_User);
if($R_User <= 0){
	$ReturnState['code'] = 1;
	echo json_encode($ReturnState);
	exit();
}*/
$Q_User = $DB->Query(
    "sys_user",
    array(
        'id',
        'username',
        'cp'
    ),
    "
        WHERE
            id = '" . $State->id . "' AND 
            username = '" . $State->username . "'
    "
);
$R_User = $DB->Row($Q_User);
$User = $DB->Result($Q_User);
if($R_User <= 0){
	$ReturnState['code'] = 1;
	echo json_encode($ReturnState);
	exit();
}

//-- Check Expire
if(time() > strtotime($State->expire_time)){
    $ReturnState['code'] = 2;
	echo json_encode($ReturnState);
	exit();
}

//-- Check Key
$Key = Core::GenPass($User['id'] . ":" . $User['username'], $State->login_time);
if($State->key != $Key){
	$ReturnState['code'] = 3;
	echo json_encode($ReturnState);
	exit();
}

$Config = array(
	'key'			=> $Key,
	'id'			=> $User['id'],
	'username'		=> $User['username'],
	'login_time'	=> $State->login_time,
	'expire_time'	=> $Expire
);

//=> Get Organizations
$Q_UOrg = $DB->Query(
    "sys_user_org",
    array(
        'uid',
        'company',
        'dept',
        'users',
        'cost_center'
    ),
    "
        WHERE uid = '" . $User['id'] . "'
    "
);
$R_UOrg = $DB->Row($Q_UOrg);
if($R_UOrg > 0){
    $UOrg = $DB->Result($Q_UOrg);

    $StateOrg = array(
        'company'   => $UOrg['company']
    );

    if(!empty($UOrg['dept'])){
        $StateOrg['dept'] = $UOrg['dept'];
    }

    if(!empty($UOrg['cost_center'])){
        $StateOrg['cost_center'] = $UOrg['cost_center'];
    }

    if(!empty($UOrg['users'])){
        $StateOrg['users'] = $UOrg['users'];
        if($UOrg['users'] != "X"){
            $StateOrg['users'] = $UOrg['uid'] . "," . $UOrg['users'];
        }
    }else{
        $StateOrg['users'] = $UOrg['uid'];
    }

    $Config = array_merge($Config, $StateOrg);
}
//=> / Get Organizations

$Config = DX::SDX(json_encode($Config));

$ReturnState = array(
	'status'	=> 1,
	'config'	=> $Config,
	//'expire'	=> strtotime(date("Y-m-d H:i:s")) . " > " . strtotime($State->expire_time)
);

if($User['cp'] == 1){
    $ReturnState['cp'] = 1;
}

include "app/useronline.php";

echo Core::ReturnData($ReturnState);
?>