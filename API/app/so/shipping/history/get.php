<?php

$Modid = 69;
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
    'def'   => 'shipping',
    'stock' => 'storeloc_stock'
);

/**
 * Get Data
 */
$Q_Data = $DB->QueryPort("
    SELECT
        s.id,
        s.company,
        s.company_abbr,
        s.company_nama,
        s.cust,
        s.cust_kode,
        s.cust_abbr,
        s.cust_nama,
        s.kode,
        s.tanggal,
        s.kontrak,
        s.kontrak_kode,
        s.kontrak_tanggal,
        s.so,
        s.so_kode,
        s.item,
        s.item_kode,
        s.item_nama,
        s.item_satuan,
        s.qty_so,
        s.qty_delivery,
        s.storeloc,
        s.storeloc_kode,
        s.storeloc_nama,
        s.remarks,
        s.create_by,
        s.create_date,
        s.verified,
        s.verified_by,
        s.verified_date,
        s.approved,
        k.currency,
        k.sold_price,
        k.ppn,
        k.inclusive_ppn
    FROM
        shipping s,
        kontrak k 
    WHERE
        s.kontrak = k.id
        AND s.id = '" . $id . "'
");
$R_Data = $DB->Row($Q_Data);
if ($R_Data > 0) {
    $Data = $DB->Result($Q_Data);

    $return['data'] = $Data;
    $return['data']['create_by'] = Core::GetUser("nama", $Data['create_by']);
    $return['data']['create_date'] = date("d/m/Y H:i:s", strtotime($Data['create_date'])) . " WIB";

    if ($Data['verified']) {
        $return['data']['verified_by'] = Core::GetUser("nama", $Data['verified_by']);
        $return['data']['verified_date'] = date("d/m/Y H:i:s", strtotime($Data['verified_date'])) . " WIB";
    }

    # Get Stock StoreLoc
    $Q_Stock = $DB->Query(
        $Table['stock'],
        array(
            'stock'
        ),
        "
            WHERE
                id = '" . $Data['storeloc'] . "'
        "
    );
    $R_Stock = $DB->Row($Q_Stock);
    if($R_Stock > 0){
        $Stock= $DB->Result($Q_Stock);

        $return['data']['stock'] = $Stock['stock'];
  
    }
}

echo Core::ReturnData($return);

?>