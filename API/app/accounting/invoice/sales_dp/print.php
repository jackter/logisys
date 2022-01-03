<?php

//=> Default Statement
$return = [];
$RPL    = "";
$SENT    = Core::Extract($_POST, $RPL);

//=> Extract Array
if (isset($SENT)) {
    foreach ($SENT as $KEY => $VAL) {
        $$KEY = $VAL;
    }
}

$Table = array(
    'cust'  => 'customer'
);

/**
 * Get Data
 */
$Q_Data = $DB->QueryPort("
    SELECT
        I.id,
        I.sc,
        I.sc_kode,
        I.kode,
        I.company,
        I.company_abbr,
        I.company_nama,
        I.cust,
        I.cust_kode,
        I.cust_nama,
        I.cust_abbr,
        I.inv_tgl,
        I.tipe,
        I.verified,
        K.syarat_penyerahan,
        K.pembayaran,
        K.dp,
        K.ppn,
        K.inclusive_ppn,
        K.sold_price,
        K.grand_total,
        K.qty,
        K.item,
        K.item_kode,
        K.item_nama,
        K.item_satuan ,
        K.tanggal AS sc_tgl
    FROM
        sales_invoice AS I,
        kontrak AS K 
    WHERE
        I.id = '" . $id . "' 
        AND I.sc = K.id
");
$R_Data = $DB->Row($Q_Data);

if ($R_Data > 0) {

    while ($Data = $DB->Result($Q_Data)) {
        $return['data'] = $Data;
        $return['data']['tanggal'] = date("D, d M Y", strtotime($Data['create_date']));
        
        //=> BUSINESS UNIT TITLE 
        $Business = $DB->Result($DB->QueryOn(
            DB['master'],
            "company",
            array(
                'business_unit'
            ),
            "
                WHERE
                    id = '" . $Data['company'] . "'
            "
        ));
        $return['data']['business_unit'] = $Business['business_unit'];

        /**
         * Select Customer
         */
        $Customer = $DB->Result($DB->Query(
            $Table['cust'],
            array(
                'kabkota'       => 'kab',
                'provinsi'      => 'prov',
                'country_nama'  => 'negara',
                'cp',
                'cp_telp1',
                'cp_telp2',
                'cp_hp1',
                'cp_hp2'
            ),
            "
                WHERE
                    id = '" . $Data['cust'] . "'
            "
        ));
        $return['data']['cust_detail'] = $Customer;
        //=> / END : Select Supplier
    }
}
//=> END : Get Data

echo Core::ReturnData($return);

?>