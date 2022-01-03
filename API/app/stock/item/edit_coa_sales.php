<?php

$Modid = 24;
Perm::Check($Modid, 'edit');

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

$Table = array(
    'def'           => 'item_sales'
);

$CreateDate = date("Y-m-d H:i:s");
$HistoryField = array(
    'table'         => $Table['def'],
    'clause'        => "WHERE item = '" . $item . "'",
    'action'        => "edit",
    'description'   => "Edited Item COA Sales"
);

$History = Core::History($HistoryField);
$Field = array(
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
    'update_by'                 => Core::GetState('id'),
    'update_date'               => $CreateDate,
    'history'                   => $History
);

$DB->ManualCommit();

/**
 * Insert Item
 */
if ($DB->Update(
    $Table['def'],
    $Field,
    "id = '" . $id . "'"
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