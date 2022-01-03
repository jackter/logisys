<?php

$Modid = 68;
Perm::Check($Modid, 'view');

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
 * Get Data
 */
$Q_Data = $DB->Query(
    $Table['def'],
    array(
        'company_ttd',
        'cust_ttd',
        'pembayaran',
        'dasar_timbangan',
        'penyerahan',
        'syarat_penyerahan',
        'syarat_penyerahan_addr',
        'company_bank_id',
        'company_bank_nama',
        'company_bank',
        'company_rek',
        'notes',
        'others',
        'mutu',
        'item',
        'item_kode',
        'item_nama',
        'item_satuan',
        'produk_kode',
        'produk_nama',
        'toleransi',
        'dp',
        'qty',
        'sold_price',
        'ppn',
        'inclusive_ppn',
        'currency',
        'grand_total',
        'transport',
    ),
    "
        WHERE 
            company = '" . $company . "'
            AND cust = '" . $cust . "'
        ORDER BY id DESC
        LIMIT 1
    "
);
$R_Data = $DB->Row($Q_Data);
if ($R_Data > 0) {
    $Data = $DB->Result($Q_Data);

    $return['data'] = $Data;
    $return['data']['inclusive_ppn'] = (int)$Data['inclusive_ppn'];
}

echo Core::ReturnData($return);

?>