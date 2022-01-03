<?php

$Modid = 99;
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
    'def'       => 'so'
);

/**
 * Field
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
    'table'         => $Table['def'],
    'clause'        => "WHERE id = '" . $id . "'",
    'action'        => "edit",
    'description'   => "Edit Sales Order " . $kode
);
$History = Core::History($HistoryField);

$Field = array(
    'company'           => $company,
    'company_abbr'      => $company_abbr,
    'company_nama'      => $company_nama,
    'cust'              => $cust,
    'cust_kode'         => $cust_kode,
    'cust_nama'         => $cust_nama,
    'cust_alamat'       => stripslashes($cust_alamat),
    'kode'              => $kode,
    'tanggal'           => $tanggal_send,
    'kontrak'           => $kontrak,
    'kontrak_kode'      => $kontrak_kode,
    'kontrak_tanggal'   => $kontrak_tanggal,
    'destination'       => $destination,
    'pod'               => $pod,
    'shipment_period'   => $shipment_period,
    'vessel'            => $vessel,
    'barges'            => $barges,
    'spesifikasi'       => $spesifikasi,
    'pembayaran'        => $pembayaran,
    'basis'             => $basis,
    'additional'        => $additional,
    'inspeksi'          => $inspeksi,
    'dokumen'           => $dokumen,
    'item'              => $item,
    'item_kode'         => $item_kode,
    'item_nama'         => $item_nama,
    'item_satuan'       => $item_satuan,
    'currency'          => $currency,
    'qty_so'            => $qty_so,
    'qty_outstanding'   => $qty_so,
    'sold_price'        => $sold_price,
    'grand_total'       => $grand_total,
    'update_by'         => Core::GetState('id'),
    'update_date'       => $Date,
    'history'           => $History
);
//=> / END : Field

$DB->ManualCommit();

/**
 * Update Data
 */
if ($DB->Update(
    $Table['def'],
    $Field,
    "
        id = '" . $id . "'
    "
)) {
    $DB->Commit();

    $return['status'] = 1;
} else {
    $return = array(
        'status'    => 0,
        'error_msg' => $GLOBALS['mysql']->error
    );
}
//=> / END : Update Data

echo Core::ReturnData($return);

?>