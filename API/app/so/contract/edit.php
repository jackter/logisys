<?php

$Modid = 68;
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
    'def'       => 'kontrak'
);

/**
 * Field
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
    'table'         => $Table['def'],
    'clause'        => "WHERE id = '" . $id . "'",
    'action'        => "edit",
    'description'   => "Edit Sales Contract " . $kode
);
$History = Core::History($HistoryField);

$Field = array(
    'company'           => $company,
    'company_abbr'      => $company_abbr,
    'company_nama'      => $company_nama,
    'company_alamat'    => stripslashes($company_alamat),
    'company_ttd'       => $company_ttd,
    'cust'              => $cust,
    'cust_kode'         => $cust_kode,
    'cust_nama'         => $cust_nama,
    'cust_abbr'         => $cust_abbr,
    'cust_alamat'       => stripslashes($cust_alamat),
    'cust_ttd'          => $cust_ttd,
    'pembayaran'        => $pembayaran,
    'dasar_timbangan'   => $dasar_timbangan,
    'penyerahan'        => $penyerahan,
    'po_tgl'            => $po_tgl_send,
    'po'                => $po,
    'syarat_penyerahan' => $syarat_penyerahan,
    'syarat_penyerahan_addr' => $syarat_penyerahan_addr,
    'company_bank_id'   => $company_bank_id,
    'company_bank_nama' => $company_bank_nama,
    'company_bank'      => $company_bank,
    'company_rek'       => $company_rek,
    'notes'             => $notes,
    'others'            => $others,
    'mutu'              => $quality,
    'bahasa'            => 1,
    'kode'              => $kode,
    'tanggal'           => $tanggal_send,
    'item'              => $item,
    'item_kode'         => $item_kode,
    'item_nama'         => $item_nama,
    'item_satuan'       => $item_satuan,
    'produk_kode'       => $produk_kode,
    'produk_nama'       => $produk_nama,
    'toleransi'         => $toleransi,
    'dp'                => $dp,
    'qty'               => $qty,
    'sold_price'        => $sold_price,
    'ppn'               => $ppn,
    'inclusive_ppn'     => $inclusive_ppn,
    'currency'          => $currency,
    'grand_total'       => $grand_total,
    'transport'         => $transport,
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
    //=> / END : Insert Detail
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