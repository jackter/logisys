<?php
require_once("config.php");

if (!checkacs(600)) {
    erroracs();
}

$_POST = cleanpost($_POST);

//=> Default Statement
$return = [];
$RPL    = "";
//$SENT	= extract(array_map(array($GLOBALS['mysql'], 'real_escape_string'), $_POST), EXTR_OVERWRITE, $RPL);
$SENT   = Core::Extract($_POST, $RPL);

//=> Extract Array
foreach ($SENT as $KEY => $VAL) {
    $$KEY = $VAL;
}

$return['status'] = 0;

//=> Clear Data
$password = Core::GenPass($username, $password);

/*$Q_User = DB_QUERY("sys_user", "WHERE username = '" . $username . "' AND password = '" . $password . "'");
$R_User = DB_ROWS($Q_User);*/

$FUser = array(
    'id',
    'username',
    'nama',
    'ip',
    'cp',
    'gperm'
);
$Q_User = $DB->Query("sys_user", $FUser, "WHERE username = '" . $username . "' AND password = '" . $password . "' AND status = 1");
$R_User = $DB->Row($Q_User);
if ($R_User > 0) {
    //$User = DB_RESULT($Q_User);
    $User = $DB->Result($Q_User);

    if($username != $User['username']){
        $return = array(
            'status'        => 0,
            'error_msg'     => 'Please check your username and password!'
        );

        echo json_encode($return, JSON_NUMERIC_CHECK);
        exit();
    }

    $LoginExpire = LOGINTIME * 60;

    $Time     = date("Y-m-d H:i:s");
    $Expire = date('Y-m-d H:i:s', time() + $LoginExpire);

    $KEY = Core::GenPass($User['id'] . ":" . $User['username'], $Time);
    $StateOptions = array(
        'key'           => $KEY,
        'id'            => $User['id'],
        'username'      => $User['username'],
        'login_time'    => $Time,
        'expire_time'   => $Expire
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
    if ($R_UOrg > 0) {
        $UOrg = $DB->Result($Q_UOrg);

        $StateOrg = array(
            'company'   => $UOrg['company']
        );

        if (!empty($UOrg['dept'])) {
            $StateOrg['dept'] = $UOrg['dept'];
        }

        if(!empty($UOrg['cost_center'])){
            $StateOrg['cost_center'] = $UOrg['cost_center'];
        }

        if (!empty($UOrg['users'])) {
            $StateOrg['users'] = $UOrg['users'];
            if ($UOrg['users'] != "X") {
                $StateOrg['users'] = $UOrg['uid'] . "," . $UOrg['users'];
            }
        } else {
            $StateOrg['users'] = $UOrg['uid'];
        }

        $StateOptions = array_merge($StateOptions, $StateOrg);
    }
    //=> / Get Organizations

    $StateOptions = DX::SDX(json_encode($StateOptions));

    $return = array(
        'status'    => 1,
        'config'    => $StateOptions,
        'profil'    => array(
            'uname'     => $User['username'],
            'nama'      => $User['nama'],
            'id'        => $User['id']
        ),
        'user' => array(
            'ip'    => $User['ip'],
            'cp'    => $User['cp'],
            'gperm' => $User['gperm']
        )
    );
} else {
    $return = array(
        'status'        => 0,
        'error_msg'     => 'Please check your username and password!'
    );
}

echo json_encode($return, JSON_NUMERIC_CHECK);

?>