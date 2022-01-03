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
 * Get Data
 * 
 * Proses untuk menampilkan data dari database
 */
$Q_Data = $DB->Query(
    $Table['def'],
    array(
        'id',
        'nama',
        'username',
        'gperm'
    ),
    "WHERE id = '" . $id . "'"
);
$R_Data = $DB->Row($Q_Data);
if($R_Data > 0){
    $Data = $DB->Result($Q_Data);

    $return['status'] = 1;

    $return['data'] = $Data;
    $return['data']['grup'] = explode(",", $Data['gperm']);

    /**
     * Get Company
     */
    $Q_Org = $DB->Query(
        $Table['def'] . "_org",
        array(),
        "
            WHERE 
                uid = '" . $Data['id'] . "'
        "
    );
    $R_Org = $DB->Row($Q_Org);
    if($R_Org > 0){
        $Org = $DB->Result($Q_Org);

        if($Org['company'] != 'X'){
            $return['data']['perusahaan'] = 1;
            $return['data']['company_selected'] = explode(",", $Org['company']);
        }else{
            $return['data']['perusahaan'] = 'X';
        }

        if($Org['users'] != 'X'){
            $return['data']['view_user'] = 1;
            $return['data']['user_selected'] = explode(",", $Org['users']);
        }else{
            $return['data']['view_user'] = 'X';
        }

        
        if($Org['cost_center'] != 'X'){
            $return['data']['view_cost_center'] = 1;
            $return['data']['cost_center_selected'] = explode(",", $Org['cost_center']);
        }else{
            $return['data']['view_cost_center'] = 'X';
        }

        if($Org['dept'] != 'X'){
            $return['data']['view_dept'] = 1;
            $return['data']['dept_selected'] = explode(",", $Org['dept']);
        }else{
            $return['data']['view_dept'] = 'X';
        }
    }
    //=> / END : Get Company

}
//=> / END : Get Data

echo Core::ReturnData($return);
?>