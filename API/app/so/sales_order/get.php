<?php
$Modid = 99;

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
    'def'       => 'so'
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
        'cust',
        'cust_kode',
        'cust_abbr',
        'cust_nama',
        'cust_alamat',
        'kode',
        'tanggal',
        'kontrak',
        'kontrak_kode',
        'kontrak_tanggal',
        'destination',
        'pod',
        'shipment_period',
        'vessel',
        'barges',
        'spesifikasi',
        'pembayaran',
        'basis',
        'additional',
        'inspeksi',
        'dokumen',
        'item',
        'item_kode',
        'item_nama',
        'item_satuan',
        'qty_so',
        'qty_outstanding',
        'currency',
        'sold_price',
        'grand_total',
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

    $return['data']['cust_alamat'] = str_replace("\\n", "<br/>", stripslashes($Data['cust_alamat']));

    $Q_SC = $DB->Query(
        'kontrak',
        array('qty'),
        "
            WHERE
                id = '" . $Data['kontrak'] . "'
        "
    );
    $R_SC = $DB->Row($Q_SC);

    if($R_SC > 0) {
        $SC = $DB->Result($Q_SC);
        
        $return['data']['qty'] = $SC['qty'];
    }

    //=> BUSINESS UNIT TITLE 
    $Business = $DB->Result($DB->QueryOn(
        DB['master'],
        "company",
        array(
            'business_unit'
        ),
        "
            WHERE
                id = '".$Data['company']."'
        "
    ));
    $return['data']['business_unit'] = $Business['business_unit'];

}

echo Core::ReturnData($return);
