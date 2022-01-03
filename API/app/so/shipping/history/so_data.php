<?php

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
    'def' => 'so'
);

$CLAUSE = " 
    WHERE id = '" . $id . "' 
";

# Load SO
$Q_Data = $DB->Query(
    $Table['def'],
    array(
        'id' => 'so',
        'kode',
        'kontrak',
        'kontrak_kode',
        'kontrak_tanggal',
        'company',
        'company_abbr',
        'company_nama',
        'cust',
        'cust_abbr',
        'cust_nama',
        'cust_kode',
        'item',
        'item_kode',
        'item_nama',
        'item_satuan',
        'qty_so',
        'qty_outstanding',
        'sold_price',
        'verified',
        'approved',
        'finish'
    ),
    $CLAUSE
);
$R_Data = $DB->Row($Q_Data);
if ($R_Data > 0) {
    $Data = $DB->Result($Q_Data);

    $return['sales_order'] = $Data;

    # Get Storeloc Stock
    $Q_SStock = $DB->QueryPort("
        SELECT
            S.id,
            S.nama,
            S.kode,
            SS.stock,
            SS.price
        FROM
            storeloc S,
            storeloc_stock SS
        WHERE
            S.id = SS.storeloc AND
            S.company = '" . $Data['company'] . "' AND 
            SS.item = '" . $Data['item'] . "' AND
            SS.stock > 0
    ");
    $R_SStock = $DB->Row($Q_SStock);
    if ($R_SStock > 0) {
        $i = 0;
        while ($SStock = $DB->Result($Q_SStock)) {

            $return['list_storeloc'][$i] = $SStock;

            $i++;
        }
        
    }

    
}

echo Core::ReturnData($return);

?>