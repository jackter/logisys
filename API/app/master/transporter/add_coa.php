<?php
$Modid = 206;

Perm::Check($Modid, 'add_coa');

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

$global = json_decode($global, true);

$Table = array(
    'def'           => 'pihakketiga_coa'
);

$CreateDate = date("Y-m-d H:i:s");

$HistoryField = array(
	'table'			=> $Table['def'],
	'clause'		=> "WHERE pihakketiga_tipe = 4 AND id = '" . $id . "'",
	'action'		=> "add",
	'description'	=> "Added new Transporter Account (" . $item_id . ")"
);

$History = Core::History($HistoryField);
$Field = array(
    'pihakketiga_tipe' => 3,
    'pihakketiga'      => $pihakketiga,
    'pihakketiga_kode' => $pihakketiga_kode,
    'pihakketiga_nama' => $pihakketiga_nama,
    'company'       => $company,
    'company_abbr'  => $company_abbr,
    'company_nama'  => $company_nama,
    'coa'           => $coa,
    'coa_kode'      => $coa_kode,
    'coa_nama'      => $coa_nama,
    'coa_accrued'           => $coa_accrued,
    'coa_kode_accrued'      => $coa_kode_accrued,
    'coa_nama_accrued'      => $coa_nama_accrued,
    'create_by'		=> Core::GetState('id'),
	'create_date'	=> $CreateDate,
	'history'		=> $History,
    'status'        => 1
);

if($DB->Insert(
    $Table['def'],
    $Field
)){
    $return['status'] = 1;
}else{
    $return = array(
        'status'    => 0,
        'error_msg' => $GLOBALS['mysql']->error
    );
}
//=> / END : Insert Item

echo Core::ReturnData($return);
?>