<?php

$Modid = 212;
Perm::Check($Modid, 'view');

#Default Statement
$return = [];
$RPL = "";
$SENT = Core::Extract($_POST, $RPL);

#Extract Array
if (isset($SENT)) {
    foreach ($SENT as $KEY => $VAL) {
        $$KEY = $VAL;
    }
}

$Q_Data = $DB->QueryPort("
    SELECT
        H.company,
        H.company_abbr,
        H.company_nama,
        H.storeloc,
        H.storeloc_kode,
        H.storeloc_nama,
        H.tanggal,
        H.kode,
        D.item,
        I.kode as item_kode,
        I.nama as item_nama,
        I.satuan as item_satuan,
        D.actual as qty
    FROM
        stock_adjustment H,
        stock_adjustment_detail D,
        item I
    WHERE
        H.id = D.header AND
        D.item = I.id AND
        H.company = '" . $company . "' AND
        H.tanggal BETWEEN '" . $fdari . "' AND '" . $fhingga . "'
    ORDER BY
        tanggal,
        kode,
        item_kode,
        item_nama ASC
");
$R_Data = $DB->Row($Q_Data);

if ($R_Data > 0) {
    while($Data = $DB->Result($Q_Data)) {
        $return['data'][] = $Data;
    }
}
echo Core::ReturnData($return);

?>