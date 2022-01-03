<?php

$Modid = 68;
Perm::Check($Modid, 'add');

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
 * Create Code
 */
$Time = date('y', strtotime($tanggal_send)) . "/";
$Time2 = romawi(date('n', strtotime($tanggal_send))) . "/";

$InitialCode = "SC/" . strtoupper($company_abbr . '-' . $cust_abbr) . "/" . $produk_kode . "/" . $Time . $Time2;
$InitialCodeCheck = "SC/" . strtoupper($company_abbr) . "%/" . $Time;
$Len = 4;
$LastKode = $DB->Result($DB->Query(
    $Table['def'],
    array('kode'),
    "
        WHERE
            kode LIKE '" . $InitialCodeCheck . "%' 
        ORDER BY 
            SUBSTR(kode, -$Len, $Len) DESC
    "
));
$LastKode = (int)substr($LastKode['kode'], -$Len) + 1;
$LastKode = str_pad($LastKode, $Len, 0, STR_PAD_LEFT);

$kode = $InitialCode . $LastKode;
//=> / END : Create Code

/**
 * Field
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
    'table'         => $Table['def'],
    'clause'        => "WHERE kode = '" . $kode . "'",
    'action'        => "add",
    'description'   => "Create Sales Contract (" . $kode . ")"
);
$History = Core::History($HistoryField);
$Field = array(
    'company'           => $company,
    'company_abbr'      => $company_abbr,
    'company_nama'      => $company_nama,
    'company_alamat'    => $company_alamat,
    'company_ttd'       => $company_ttd,
    'cust'              => $cust,
    'cust_kode'         => $cust_kode,
    'cust_nama'         => $cust_nama,
    'cust_abbr'         => $cust_abbr,
    'cust_alamat'       => $cust_alamat,
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
    'create_by'         => Core::GetState('id'),
    'create_date'       => $Date,
    'history'           => $History
);
//=> / END : Field
$DB->ManualCommit();

/**
 * Insert Data
 */
if ($DB->Insert(
    $Table['def'],
    $Field
)) {

    /**
     * Insert Detail
     */
    // $Q_Header = $DB->Query(
    //     $Table['def'],
    //     array('id'),
    //     "
    //         WHERE
    //             kode = '" . $kode . "' AND
    //             create_date = '" . $Date . "'
    //     "
    // );
    // $R_Header = $DB->Row($Q_Header);
    // if ($R_Header > 0) {
    //     $Header = $DB->Result($Q_Header);

    //     for ($i = 0; $i < sizeof($list); $i++) {
    //         if (!empty($list[$i]['id'])) {

    //             $FieldDetail = array(
    //                 'header'            => $Header['id'],
    //                 'item'              => $list[$i]['id'],
    //                 'item_kode'         => $list[$i]['kode'],
    //                 'item_satuan'       => $list[$i]['satuan'],
    //                 'item_nama'         => $list[$i]['nama'],
    //                 'sold_price'        => $list[$i]['sold_price'],
    //                 'qty'               => $list[$i]['qty'],
    //                 'qty_outstanding'   => $list[$i]['qty'],
    //                 'toleransi'         => $list[$i]['toleransi'],
    //                 'dp'                => $list[$i]['dp']
    //             );

    //             $return['detail'][$i] = $FieldDetail;

    //             if ($DB->Insert(
    //                 $Table['detail'],
    //                 $FieldDetail
    //             )) {
    //                 $return['status_detail'][$i] = array(
    //                     'index'     => $i,
    //                     'status'    => 1,
    //                 );
    //             } else {
    //                 $return['status_detail'][$i] = array(
    //                     'index'     => $i,
    //                     'status'    => 0,
    //                     'error_msg' => $GLOBALS['mysql']->error
    //                 );
    //             }
    //         }
    //     }
    // }
    //=> / END : Insert Detail
    $DB->Commit();

    $return['status'] = 1;
} else {
    $return = array(
        'status'    => 0,
        'error_msg' => $GLOBALS['mysql']->error
    );
}

echo Core::ReturnData($return);

?>