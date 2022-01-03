<?php
$Modid = 86;

Perm::Check($Modid, 'edit');

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
    'def'   => 'coa_master'
);

/**
 * Field
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
	'table'			=> $Table['def'],
	'clause'		=> "WHERE id = '" . $id . "'",
	'action'		=> "edit",
	'description'	=> "Edit COA"
);
$History = Core::History($HistoryField);

if($is_h == true){
    $is_h = 1;
}
else{
    $is_h = 0;
}

$Field = array(
    'company'       => $company,
    'company_abbr'  => $company_abbr,
    'company_nama'  => $company_nama,
    'kode'          => $account_no,
    'lv1'           => $lv1,
    'lv2'           => $lv2,
    'lv3'           => $lv3,
    'lv4'           => $lv4,
    'lv5'           => $lv5,
    'nama'          => $account_name,
    'type'          => $account_type,
    'is_h'          => $is_h,
    'update_by'		=> Core::GetState('id'),
	'update_date'	=> $Date,
	'history'		=> $History
);
//=> / END : Field

/**
 * Insert Data
 */
if($DB->Update(
    $Table['def'],
    $Field,
    "
        id = '" . $id . "'
    "
)){
    $return['status'] = 1;
}else{
    $return = array(
        'status'    => 0,
        'error_msg' => $GLOBALS['mysql']->error
    );
}
//>> End: Insert Data

echo Core::ReturnData($return);
?>