<?php
$Modid = 131;

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
    'def'           => 'item_grup_coa'
);

$Date = date("Y-m-d H:i:s");
$HistoryField = array(
	'table'			=> $Table['def'],
	'clause'		=> "WHERE id = '" . $id . "'",
	'action'		=> "edit",
	'description'	=> "Edited Item Group COA"
);

$History = Core::History($HistoryField);
$Field = array(

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
    'update_by'		            => Core::GetState('id'),
	'update_date'	            => $Date,
	'history'		            => $History
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