<?php
$Modid = 42;

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
    'def'           => 'pihakketiga_coa'
);

$CreateDate = date("Y-m-d H:i:s");
$HistoryField = array(
	'table'			=> $Table['def'],
	'clause'		=> "WHERE pihakketiga_tipe = 0 AND id = '" . $id . "'",
	'action'		=> "edit",
	'description'	=> "Edited Supplier Account (" . $item_id . ")"
);

$History = Core::History($HistoryField);
$Field = array(
    'coa'           => $coa,
    'coa_kode'      => $coa_kode,
    'coa_nama'      => $coa_nama,
    'coa_accrued'           => $coa_accrued,
    'coa_kode_accrued'      => $coa_kode_accrued,
    'coa_nama_accrued'      => $coa_nama_accrued,
    'update_by'     => Core::GetState('id'),
	'update_date'   => $CreateDate,
	'history'	    => $History
);

/**
 * Insert Item
 */
if($DB->Update(
    $Table['def'],
    $Field,
    "id = '" . $id . "'"
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