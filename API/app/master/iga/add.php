<?php
$Modid = 131;

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

$global = json_decode($global, true);

$Table = array(
    'def'           => 'item_grup_coa'
);

$Date = date("Y-m-d H:i:s");

$HistoryField = array(
	'table'			=> $Table['def'],
	'clause'		=> "WHERE id = '" . $id . "'",
	'action'		=> "add",
	'description'	=> "Create Item Group COA"
);
$History = Core::History($HistoryField);

$Field = array(
    'company'                   => $company,
    'company_abbr'              => $company_abbr,
    'company_nama'              => $company_nama,
    'item_grup_id'              => $grup,
    'item_grup_kode'            => $grup_kode,
    'item_grup_nama'            => $grup_nama,
    'coa_persediaan'            => $coa_persediaan,
    'coa_kode_persediaan'       => $coa_kode_persediaan,
    'coa_nama_persediaan'       => $coa_nama_persediaan,
    'coa_penjualan'             => $coa_penjualan,
    'coa_kode_penjualan'        => $coa_kode_penjualan,
    'coa_nama_penjualan'        => $coa_nama_penjualan,
    'coa_disc_penjualan'        => $coa_disc_penjualan,
    'coa_kode_disc_penjualan'   => $coa_kode_disc_penjualan,
    'coa_nama_disc_penjualan'   => $coa_nama_disc_penjualan,
    'coa_retur_penjualan'       => $coa_retur_penjualan,
    'coa_kode_retur_penjualan'  => $coa_kode_retur_penjualan,
    'coa_nama_retur_penjualan'  => $coa_nama_retur_penjualan,
    'coa_retur_pembelian'       => $coa_retur_pembelian,
    'coa_kode_retur_pembelian'  => $coa_kode_retur_pembelian,
    'coa_nama_retur_pembelian'  => $coa_nama_retur_pembelian,
    'coa_hpp'                   => $coa_hpp,
    'coa_kode_hpp'              => $coa_kode_hpp,
    'coa_nama_hpp'              => $coa_nama_hpp,
    'coa_accrued'               => $coa_accrued,
    'coa_kode_accrued'          => $coa_kode_accrued,
    'coa_nama_accrued'          => $coa_nama_accrued,
    'coa_beban'                 => $coa_beban,
    'coa_kode_beban'            => $coa_kode_beban,
    'coa_nama_beban'            => $coa_nama_beban,
    'create_by'                 => Core::GetState('id'),
    'create_date'	            => $Date,
    'history'		            => $History,
    'status'                    => 1
);

/**
 * Insert Item
 */
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