<?php
$Modid = 24;

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
    'def'       => 'item_coa'
);

$CLAUSE = "";

$CLAUSE .= "
    AND company = '" . $company . "'
";

/**
 * Get Data
 */
$Q_Data = $DB->Query(
    $Table['def'],
    array(
        'id',
        'item_id',
        'item_type',
        'coa_persediaan',
        'coa_kode_persediaan',
        'coa_nama_persediaan',
        'coa_penjualan',
        'coa_kode_penjualan',
        'coa_nama_penjualan',
        'coa_disc_penjualan',
        'coa_kode_disc_penjualan',
        'coa_nama_disc_penjualan',
        'coa_retur_penjualan',
        'coa_kode_retur_penjualan',
        'coa_nama_retur_penjualan',
        'coa_retur_pembelian',
        'coa_kode_retur_pembelian',
        'coa_nama_retur_pembelian',
        'coa_hpp',
        'coa_kode_hpp',
        'coa_nama_hpp',
        'coa_accrued',
        'coa_kode_accrued',
        'coa_nama_accrued',
        'coa_beban',
        'coa_kode_beban',
        'coa_nama_beban'
    ),
    "
        WHERE 
            item_id = '" . $id . "'
            $CLAUSE
    "
);
$R_Data = $DB->Row($Q_Data);
if($R_Data > 0){
    $Data = $DB->Result($Q_Data);

    $return['data'] = $Data;
}
//=> / END : Get Data

echo Core::ReturnData($return);
?>