<?php
$Modid = 73;

Perm::Check($Modid, 'view');

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

/**
 * Get Data
 */
$Q_Data = $DB->QueryPort("
    SELECT
        I.id,
        I.sc,
        I.sc_kode,
        I.company,
        I.company_abbr,
        I.company_nama,
        I.cust,
        I.cust_kode,
        I.cust_nama,
        I.cust_abbr,
        I.inv_tgl,
        I.tipe,
        K.dp,
        K.ppn,
        K.inclusive_ppn,
        K.sold_price,
        K.grand_total,
        K.qty,
        K.item,
        K.item_kode,
        K.item_nama,
        K.item_satuan 
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

    }
}
//=> END : Get Data

echo Core::ReturnData($return);

?>