<?php

$Modid = 24;
Perm::Check($Modid, 'add_coa');

//=> Default Statement
$return = [];
$RPL    = "";
$SENT   = Core::Extract($_POST, $RPL);

//=> Extract Array
if (isset($SENT)) {
    foreach ($SENT as $KEY => $VAL) {
        $$KEY = $VAL;
    }
}

$global = json_decode($global, true);

$Table = array(
    'def'           => 'item_coa',
    'def_item'      => 'item'
);

$CreateDate = date("Y-m-d H:i:s");

$HistoryField = array(
    'table'         => $Table['def'],
    'clause'        => "WHERE item_id = '" . $item_id . "'",
    'action'        => "add",
    'description'   => "Added new Item COA (" . $item_id . ")"
);

$History = Core::History($HistoryField);
$Field = array(
    'item_type'                 => $item_type,
    'item_id'                   => $item_id,
    'company'                   => $company,
    'company_abbr'              => $company_abbr,
    'company_nama'              => $company_nama,
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
    'create_date'               => $CreateDate,
    'history'                   => $History,
    'status'                    => 1
);

/**
 * Insert Item
 */

$Field2 = array(
    'verified'      => 1,
    'verified_by'   => Core::GetState('id'),
    'verified_date' => $CreateDate,
);

$DB->ManualCommit();

if ($DB->Insert(
    $Table['def'],
    $Field
)) {
    if ($DB->Update(
        $Table['def_item'],
        $Field2,
        "id = '" . $item_id . "'"
    )) {
        $DB->Commit();
        $return['status'] = 1;
    } else {
        $return = array(
            'status'    => 0,
            'error_msg' => $GLOBALS['mysql']->error
        );
    }
} else {
    $return = array(
        'status'    => 0,
        'error_msg' => $GLOBALS['mysql']->error
    );
}
//=> / END : Insert Item

echo Core::ReturnData($return);

?>