<?php
$Modid = 198;

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
    'def'        => 'bl'
);

/**
 * Get Data
 */
$Q_Data = $DB->QueryPort("
    SELECT
        b.id,
        b.company,
        b.company_abbr,
        b.company_nama,
        b.cust,
        b.cust_kode,
        b.cust_abbr,
        b.cust_nama,
        b.kode,
        b.tanggal,
        b.kontrak,
        b.kontrak_kode,
        b.so,
        b.so_kode,
        b.item,
        b.item_kode,
        b.item_nama,
        b.item_satuan,
        b.qty_so,
        b.qty_shipping,
        b.qty_bl,
        b.remarks,
        b.verified,
        b.approved,
        b.create_by,
        b.create_date,
        b.verified,
        b.verified_by,
        b.verified_date,
        b.approved,
        b.approved_by,
        b.approved_date,
        k.currency,
        k.sold_price,
        k.ppn,
        k.inclusive_ppn
    FROM
        bl b,
        kontrak k 
    WHERE
        b.kontrak = k.id
        AND b.id = '" . $id . "'
");
$R_Data = $DB->Row($Q_Data);
if ($R_Data > 0) {
    $Data = $DB->Result($Q_Data);

    $return['data'] = $Data;
    $return['data']['create_by'] = Core::GetUser("nama", $Data['create_by']);
    if($Data['approved_by']){
        $return['data']['approved_by'] = Core::GetUser("nama", $Data['approved_by']);
    }
}

echo Core::ReturnData($return);

?>