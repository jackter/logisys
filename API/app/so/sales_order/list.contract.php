<?php
//=> Default Statement
$return = [];
$RPL	= "";
$SENT	= Core::Extract($_POST, $RPL);

//=> Extract Array
if(isset($SENT)){
    foreach($SENT as $KEY => $VAL){	
        $$KEY = $VAL;
    }
}

$Table = array(
    'def'           => 'kontrak'
);

$CLAUSE = "";
if($keyword != '' && isset($keyword)){
    $CLAUSE .= " 
        AND kode LIKE '%" . $keyword . "%'
    ";
}

if($company != '' && isset($company)){
    $CLAUSE .= "
        AND company = '" . $company . "'
    ";
}

if($cust != '' && isset($cust)){
    $CLAUSE .= "
        AND cust = '" . $cust . "'
    ";
}

/**
 * Get Data
 */
$Q_Contract = $DB->Query(
    $Table['def'],
    array(
        'id',
        'company',
        'company_abbr',
        'company_nama',
        'company_alamat',
        'company_ttd',
        'cust',
        'cust_kode',
        'cust_nama',
        'cust_alamat',
        'cust_ttd',
        'kode',
        'tanggal' => 'kontrak_tanggal',
        'mutu',
        'pembayaran',
        'dasar_timbangan',
        'item',
        'item_kode',
        'item_nama',
        'item_satuan',
        'qty',
        'sold_price',
        'ppn',
        'inclusive_ppn',
        'currency'
    ),
    "
        WHERE
            approved = 1 AND
            id NOT IN (SELECT kontrak FROM so)
            $CLAUSE
        GROUP BY
            id
    "
);
$R_Contract = $DB->Row($Q_Contract);
if($R_Contract > 0){

    $i = 0;
    while($Contract = $DB->Result($Q_Contract)){
        $return[$i] = $Contract;

        $Item = $DB->Result($Q_Item = $DB->Query(
            'item',
            array('in_decimal'),
            "
                WHERE
                    id = '" . $Data['item'] . "'
            "
        ));

        $return[$i]['item_in_decimal'] = $Item['in_decimal'];

        $i++;
    }
}

echo Core::ReturnData($return);
?>