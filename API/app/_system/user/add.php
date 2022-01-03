<?php
$Modid = 13;

Perm::Check($Modid, 'add');

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

/**
 * Check Username
 */
$Check = $DB->Row($DB->Query(
    $Table['def'],
    array('id'),
    "WHERE LOWER(username) = '" . strtolower($username) . "'"
));
if($Check > 0){
    $return = array(
        'status'    => 0,
        'error_msg' => 'Username sudah ada / tidak dapat digunakan.'
    );

    echo Core::ReturnData($return);
    exit();
}
//=> / END : Check Username

/**
 * Clean Sent Data
 * 
 * normalisasi data yang dikirimkan dari form
 * agar sesuai dengan format yang dibutuhkan oleh database
 */
$gperm = json_decode($gperm);
$gperm = implode(",", $gperm);
$company = json_decode($company, true);
$dept = json_decode($dept, true);
$cost_center = json_decode($cost_center, true);
$users = json_decode($users, true);

$Password = Core::GenPass($username, $password);

//=> Create History
$HistoryField = array(
	'table'			=> $Table['def'],
    'clause'		=> "",
	'action'		=> "add",
	'description'	=> "Added this User"
);
$History = Core::History($HistoryField);
//=> / END : Clean Sent Data

$Date = date('Y-m-d H:i:s');

/**
 * Set Perusahaan
 */
$ORG = [];
if($perusahaan != 'X'){
    if(isset($perusahaan)){
        $formatted_company = $COMMA = "";
        foreach($company AS $Key => $Val){
            $formatted_company .= $COMMA . $Val['id'];
            $COMMA = ",";
        }
        $ORG['company'] = $formatted_company;
    }
}else{
    $ORG['company'] = 'X';
}
//=> / END : Set Perusahaan

/**
 * Set Dept
 */
if($view_dept != 'X'){
    if(isset($dept)){
        $formatted_dept = $COMMA = "";
        foreach($dept AS $Key => $Val){
            $formatted_dept .= $COMMA . $Val['id'];
            $COMMA = ",";
        }
        $ORG['dept'] = $formatted_dept;
    }
}else{
    $formatted_dept = 'X';
    $ORG['dept'] = $formatted_dept;
}
//=> / END : Set Dept

/**
 * Set Cost Center
 */
if($view_cost_center != 'X'){
    if(isset($cost_center)){
        $formatted_cost_center = $COMMA = "";
        foreach($cost_center AS $Key => $Val){
            $formatted_cost_center .= $COMMA . $Val['id'];
            $COMMA = ",";
        }
        if($formatted_cost_center){
            $ORG['cost_center'] = $formatted_cost_center;
        }
    }
}else{
    $ORG['cost_center'] = 'X';
}
//=> / END : Set cost_center

/**
 * Set Users
 */
if($view_user != 'X'){
    if(isset($users)){
        $formatted_users = $COMMA = "";
        foreach($users AS $Key => $Val){
            $formatted_users .= $COMMA . $Val['id'];
            $COMMA = ",";
        }
        if($formatted_users){
            $ORG['users'] = $formatted_users;
        }
    }
}else{
    $ORG['users'] = 'X';
}
//=> / END : Set Users

/**
 * Insert to Sys Group
 * 
 * Fugsi yang digunakan untuk memasukkan data ke table sys_user
 */
$Fields = array(
    'nama'              => $nama,
    'username'          => strtolower($username),
    'password'          => $Password,
    'gperm'             => $gperm,
    'ip'                => 'x',
    'cp'                => 1,
    'create_by'         => Core::GetState('id'),
    'create_date'       => $Date,
    'history'           => $History,
    'status'            => 1
);

if($DB->Insert($Table['def'], $Fields)){

    /**
     * Select User
     */
    $User = $DB->Result($DB->Query(
        $Table['def'],
        array(
            'id'
        ),
        "
            WHERE
                username = '" . strtolower($username) . "' AND 
                create_date = '" . $Date . "'
        "
    ));
    $ORG['uid'] = $User['id'];

    /*if($ORG['users'] != "X"){
        $COMMA = "";
        if(!empty($ORG['users'])){
            $COMMA = ",";
        }
        $ORG['users'] = $User['id'] . $COMMA . $ORG['users'];
    }*/
    //=> / END : Select User

    /**
     * sys_user_org
     */
    if($DB->Insert(
        $Table['def'] . "_org",
        $ORG
    )){
        $return['status'] = 1;
    }else{
        $return = array(
            'status'    => 0,
            'error_msg' => 'Gagal menambah user_org'
        );
    }
    //=> / END : sys_user_org

}else{
    $return = array(
        'status'    => 0,
        'error_msg' => 'Gagal Menyimpan data'
    );
}
//=> / END : Insert to Sys Group

echo Core::ReturnData($return);
?>