<?php

$Modid = 99;
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
    'def'       => 'so'
);

/**
 * Create Code
 */
$Time = date('y') . "/" . romawi(date('n')) . "/";
$InitialCode = "SO/" . strtoupper($company_abbr . '-' . $cust_abbr) . "/" . $Time;
$Len = 4;
$LastKode = $DB->Result($DB->Query(
    $Table['def'],
    array('kode'),
    "
        WHERE
            kode LIKE '" . $InitialCode . "%' 
        ORDER BY 
            REPLACE(kode, '" . $InitialCode . "', '') DESC
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
    'table'            => $Table['def'],
    'clause'        => "WHERE kode = '" . $kode . "'",
    'action'        => "add",
    'description'    => "Create SO (" . $kode . ")"
);
$History = Core::History($HistoryField);
$Field = array(
    'company'           => $company,
    'company_abbr'      => $company_abbr,
    'company_nama'      => $company_nama,
    'cust'              => $cust,
    'cust_kode'         => $cust_kode,
    'cust_abbr'         => $cust_abbr,
    'cust_nama'         => $cust_nama,
    'cust_alamat'       => $cust_alamat,
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