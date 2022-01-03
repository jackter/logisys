<?php

$Modid = 200;

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
    'def'       => 'so',
    'kontrak'   => 'kontrak',
    'ship'      => 'shipping'
);


if ($keyword != '' && isset($keyword)) {
    $CLAUSE .= " 
        AND kontrak_kode LIKE '%" . $keyword . "%'
    ";
}

if($company != '' && isset($company)){
    $CLAUSE .= "
        AND S.company = '" . $company . "'
    ";
}

if($cust != '' && isset($cust)){
    $CLAUSE .= "
        AND S.cust = '" . $cust . "'
    ";
}

# Get List
$Q_Data = $DB->QueryPort("
    SELECT
        S.id,
        S.company,
        S.company_abbr,
        S.company_nama,
        S.cust,
        S.cust_kode,
        S.cust_nama,
        S.cust_abbr,
        S.kode,
        S.kontrak,
        S.kontrak_kode,
        S.tanggal,
        S.item,
        S.item_kode,
        S.item_nama,
        S.item_satuan,
        S.qty_so 
    FROM
        so AS S,
        kontrak AS K
    WHERE
        S.kontrak NOT IN (SELECT kontrak FROM sales_handover) AND 
        S.kontrak = K.id AND
        K.transport = 1 AND 
        S.approved = 1 
        $CLAUSE
    GROUP BY
        S.kontrak
    LIMIT
        100
"
);
$R_Data = $DB->Row($Q_Data);
if ($R_Data > 0) {
    $i = 0;
    while ($Data = $DB->Result($Q_Data)) {
        $return['list'][$i] = $Data;

        #Get Detail
        $Q_Detail = $DB->Query(
            $Table['ship'],
            array(
                'id',
                'tanggal' => 'ship_tanggal',
                'kode' => 'ship_kode',
                'qty_delivery' => 'qty_shipping',
                'item_satuan',
                'remarks'
            ),
            "
                WHERE 
                    kontrak = '" . $Data['kontrak'] . "' AND
                    approved = 1
            "
        );
        $R_Detail = $DB->Row($Q_Detail);
        if ($R_Detail > 0) {
            $j = 0;
            while ($Detail = $DB->Result($Q_Detail)) {
                $return['list'][$i]['detail'][$j] = $Detail;
                $j++;
            }
        }
        $i++;
    }
}

echo Core::ReturnData($return);

?>