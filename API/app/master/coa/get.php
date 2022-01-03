<?php
$Modid = 86;

Perm::Check($Modid, 'view');

//=> Default Statement
$return = [];
$RPL	= "";
$SENT	= Core::Extract($_POST, $RPL);

//=> Extract Array
if(isset($SENT)){
    foreach($SENT as $KEY => $VAL){	
        $$KEY = $VAL;
    }
}

$Table = array(
    'def'       => 'coa_master'
);

/**
 * Get Data
 */
$Q_Data = $DB->Query(
    $Table['def'],
    array(
        'id',
        'company',
        'company_abbr',
        'company_nama',
        'kode'  => 'account_no',
        'nama'  => 'account_name',
        'lv1',
        'lv2',
        'lv3',
        'lv4',
        'lv5',
        'is_h',
        'type'  => 'account_type',
        'opening_balance',
        'opening_as_of' => 'date_balance'
    ),
    "
        WHERE id = '" . $id . "'
    "
);
$R_Data = $DB->Row($Q_Data);
if($R_Data > 0){

    $Data = $DB->Result($Q_Data);

    $return['data'] = $Data;
    $return['data']['type'] = 1;

    if($Data['lv2'] > 0){

        $return['data']['sub'] = 1; //aktif checkbox
    
        for($i = 2; $i <= 5; $i++){ //get id sub akun
    
            if($Data['lv'.$i] >= 1){
    
                $ID_level = $Data['lv'.$i];
    
            }
        }

        $Q_Sub = $DB->Result($DB->Query(
            $Table['def'],
            array(
                'id',
                'kode',
                'nama'
            ),
            "
                WHERE
                    id = '".$ID_level."'
            "
        ));

        $return['data']['accountof'] = $Q_Sub['id'];
        $return['data']['account_of'] = $Q_Sub['nama'];
    }

}

echo Core::ReturnData($return);
?>