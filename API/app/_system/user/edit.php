<?php
$Modid = 13;

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
    'def'       => 'sys_user'
);

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

//=> Create History
$HistoryField = array(
	'table'			=> $Table['def'],
    'clause'		=> "WHERE id = '" . $id . "'",
	'action'		=> "add",
	'description'	=> "Edit this User"
);
$History = Core::History($HistoryField);
//=> / END : Clean Sent Data

$Date = date('Y-m-d H:i:s');

/**
 * Set Perusahaan
 */
$ORG = [];
if($perusahaan != 'X'){
    if(isset($company)){
        $formatted_company = $COMMA = "";
        foreach($company AS $Key => $Val){
            $formatted_company .= $COMMA . $Val['id'];
            $COMMA = ",";
        }
        $ORG['company'] = $formatted_company;
    }
}else{
    $formatted_company = 'X';
    $ORG['company'] = $formatted_company;
}
//=> / END : Set Perusahaan

/**
 * Set Dept
 */
//$ORG = [];
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
    $formatted_cost_center = 'X';
    $ORG['cost_center'] = $formatted_cost_center;
}


//=> / END : Set cost_center

/**
 * Set Users
 */
//$ORG['users'] = NULL;
if($view_user != 'X'){
    if(isset($users)){
        $formatted_users =  $COMMA = "";
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
 * Update to Sys User
 * 
 * Fugsi yang digunakan untuk memodifikasi data ke table sys_user
 */
$Fields = array(
    'nama'              => $nama,
    'gperm'             => $gperm,
    'update_by'         => Core::GetState('id'),
    'update_date'       => $Date,
    'history'           => $History,
);
if(!empty($password)){
    $Password = Core::GenPass($username, $password);

    $Fields['password']     = $Password;
    $Fields['cp']           = 1;

}
if($DB->Update(
    $Table['def'], 
    $Fields,
    "id = '" . $id . "'"
)){

    /**
     * sys_user_org
     */
    if($DB->Update(
        $Table['def'] . "_org",
        $ORG,
        "uid = '" . $id . "'"
    )){
        $return['status'] = 1;
    }else{
        $return = array(
            'status'    => 0,
            'error_msg' => 'Gagal update user_org'
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