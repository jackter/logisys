<?php
$Modid = 80;

Perm::Check($Modid, 'add');

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
    'def'       => 'company_bank'
);

/**
 * Field
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
	'table'			=> $Table['def'],
	'clause'		=> "WHERE id = '" . $id . "'",
	'action'		=> "add",
	'description'	=> "Create Bank"
);
$History = Core::History($HistoryField);

$Field = array(
    'no_rekening'       => $no_rekening,
    'nama_rekening'     => $nama_rekening,
    'bank'              => $bank,
    'bank_kode'         => $bank_kode,
    'bank_nama'         => $bank_nama,
    'coa'               => $coa,
    'coa_kode'          => $coa_kode,
    'coa_nama'          => $coa_nama,
    'currency'          => $currency,
    'company'           => $company,
    'company_abbr'      => $company_abbr,
    'company_nama'      => $company_nama,
    'cash'              => $cash,
    'saldo'             => $saldo,
    'saldo_minimum'     => $saldo_minimum,
    'history'           => $HistoryField,
    'create_by'         => Core::GetState('id'),
    'create_date'	    => $Date,
    'history'		    => $History,
    'status'            => 1
);
//=> / END : Field

/**
 * Insert Data
 */
if($DB->Insert(
    $Table['def'],
    $Field
)){
    $return['status'] = 1;
}
else{
    $return = array(
        'status'    => 0,
        'error_msg' => $GLOBALS['mysql']->error
    );
}
//>> End: Insert Data

echo Core::ReturnData($return);
?>