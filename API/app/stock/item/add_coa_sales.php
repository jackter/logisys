<?php

$Modid = 24;
Perm::Check($Modid, 'add_coa_sales');

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
    'def'           => 'item_sales',
    'def_item'      => 'item'
);

$CreateDate = date("Y-m-d H:i:s");

$HistoryField = array(
    'table'         => $Table['def'],
    'clause'        => "WHERE item = '" . $item . "'",
    'action'        => "add",
    'description'   => "Added new Item COA Sales (" . $item . ")"
);

$History = Core::History($HistoryField);
$Field = array(
    'item'                      => $item,
    'kode'                      => $kode,
    'nama'                      => $nama,
    'company'                   => $company,
    'company_abbr'              => $company_abbr,
    'company_nama'              => $company_nama,
    'coa_persediaan'            => $coa_persediaan,
    'coa_kode_persediaan'       => $coa_kode_persediaan,
    'coa_nama_persediaan'       => $coa_nama_persediaan,
    'coa_penjualan'             => $coa_penjualan,
    'coa_kode_penjualan'        => $coa_kode_penjualan,
    'coa_nama_penjualan'        => $coa_nama_penjualan,
    'coa_accrued'               => $coa_accrued,
    'coa_kode_accrued'          => $coa_kode_accrued,
    'coa_nama_accrued'          => $coa_nama_accrued,
    'coa_cogs'                  => $coa_cogs,
    'coa_kode_cogs'             => $coa_kode_cogs,
    'coa_nama_cogs'             => $coa_nama_cogs,
    'create_by'                 => Core::GetState('id'),
    'create_date'               => $CreateDate,
    'history'                   => $History,
    'status'                    => 1
);

/**
 * Insert Item
 */

$DB->ManualCommit();

if ($DB->Insert(
    $Table['def'],
    $Field
)) {
    $DB->Commit();
    $return['status'] = 1;
} else {
    $return = array(
        'status'    => 0,
        'error_msg' => $GLOBALS['mysql']->error
    );
}
//=> / END : Insert Item

echo Core::ReturnData($return);

?>