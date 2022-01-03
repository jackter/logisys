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
        'id',
        'company',
        'company_abbr',
        'company_nama',
        'company_ttd',
        'company_alamat',
        'cust',
        'cust_kode',
        'cust_nama',
        'cust_abbr',
        'cust_alamat',
        'cust_ttd',
        'pembayaran',
        'dasar_timbangan',
        'penyerahan',
        'po_tgl',
        'po',
        'syarat_penyerahan',
        'syarat_penyerahan_addr',
        'company_bank_id',
        'company_bank_nama',
        'company_bank',
        'company_rek',
        'notes',
        'others',
        'mutu',
        'bahasa',
        'kode',
        'tanggal',
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
        'verified',
        'approved'
    ),
    "
        WHERE 
            id = '" . $id . "'
    "
);
$R_Data = $DB->Row($Q_Data);
if ($R_Data > 0) {
    $Data = $DB->Result($Q_Data);

    $return['data'] = $Data;
    $return['data']['inclusive_ppn'] = (int)$Data['inclusive_ppn'];

    $return['data']['cust_alamat'] = str_replace("\\n", "<br/>", stripslashes($Data['cust_alamat']));
    $return['data']['company_alamat'] = str_replace("\\n", "<br/>", stripslashes($Data['company_alamat']));

    /**
     * get company & group
     */
    $Q_Company = $DB->QueryOn(
        DB['master'],
        "company",
        array(
            'logo'
        ),
        "
        WHERE 
            id = '" . $Data['company'] . "'
        "
    );
    $R_Company = $DB->Row($Q_Company);
    if ($R_Company > 0) {
        $Company = $DB->Result($Q_Company);

        $return['data']['company_logo'] = $Company['logo'];
    }

    $Q_CompanyBank = $DB->Query(
        "company_bank",
        array(
            'swift_code'
        ),
        "
        WHERE 
            id = '" . $Data['company_bank_id'] . "'
        "
    );
    $R_CompanyBank = $DB->Row($Q_CompanyBank);
    if ($R_CompanyBank > 0) {
        $CompanyBank = $DB->Result($Q_CompanyBank);

        $return['data']['company_swift_code'] = $CompanyBank['swift_code'];
    }
}

echo Core::ReturnData($return);

?>