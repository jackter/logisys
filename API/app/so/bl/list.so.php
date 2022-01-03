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
    'def'       => 'so',
    'kontrak'   => 'kontrak',
    'ship'      => 'shipping'
);

$CLAUSE = "";
if($keyword != '' && isset($keyword)){
    $CLAUSE .= " 
        AND S.kode LIKE '%" . $keyword . "%'
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

/**
 * Get Data
 */
$Q_SO = $DB->QueryPort("
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
        S.kontrak = k.id
        AND K.transport = 0
        AND S.approved = 1
        AND S.bl = 0
        $CLAUSE
        GROUP BY
            id
"
);
$R_SO = $DB->Row($Q_SO);
if($R_SO > 0){

    $i = 0;
    while($SO = $DB->Result($Q_SO)){
        $return[$i] = $SO;

        $Transport = $DB->Result($DB->Query(
            $Table['kontrak'],
            array(
                'transport'
            ),
            "
                WHERE
                    id = " . $SO['kontrak'] . "
            "
        ));

        if($Transport){
            $return[$i]['transport'] = $Transport['transport'];
        }

        /**
         * IS SHIPPING
         */
        $Q_Shipping = $DB->QueryPort("
            SELECT
                SUM(qty_delivery) AS total_delivery
            FROM
                " . $Table['ship'] . "
            WHERE
                so = '" . $SO['id'] . "'
                AND verified = 1
        ");
        $R_Shipping = $DB->Row($Q_Shipping);
        if ($R_Shipping > 0) {
            $Shipping = $DB->Result($Q_Shipping);
            $return[$i]['qty_shipping'] = $Shipping['total_delivery'];
        }
        //=> / END : IS SHIPPING

        $i++;
    }
}

echo Core::ReturnData($return);
?>