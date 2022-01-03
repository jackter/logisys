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
    'def'      => 'sales_invoice',
    'pihak'    => 'pihakketiga_coa'
);

$CLAUSE = "";
if($keyword != '' && isset($keyword)){
    $CLAUSE .= " 
        AND (kode LIKE '%" . $keyword . "%' OR
        kode LIKE '" . $keyword . "%')
    ";
}

if($customer != '' && isset($customer) && $reff_type == 1){
    $CLAUSE .= " 
        AND cust = '" . $customer . "'
    ";
}

if($company != '' && isset($company)){
    $CLAUSE .= "
        AND company = '" . $company . "'
    ";
}

$detail = json_decode($detail_send, true);

if(is_array($detail)){
    if(sizeof($detail) > 0){
        $format_id = $COMMA = "";
        for ($i = 0; $i < sizeof($detail); $i++) {
            if($detail[$i]['reff_id']){
                $format_id .= $COMMA . $detail[$i]['reff_id'];

                if($i < sizeof($detail)-2){
                    $COMMA = ",";
                }
            }
        }

        if($format_id != ""){
            $CLAUSE .= "
                AND id NOT IN (" . $format_id . ")
            ";
        }
    }
}

/**
 * Extract Reff
 */
$Q_Reff = $DB->Query(
    $Table['def'],
    array(
        'id',
        'kode',
        'tipe',
        'amount',
        'payment_amount',
        'cust' => 'customer'
    ),
    "
        WHERE
            status != 0 AND
            verified = 1 AND
            payment_amount != amount
            $CLAUSE
        ORDER BY
            kode ASC
        LIMIT
            100
    "
);
$R_Reff = $DB->Row($Q_Reff);
if($R_Reff > 0){
    $i = 0;
    while($Reff = $DB->Result($Q_Reff)){
        $return['data'][$i] = $Reff;

        $Detail = $DB->Result($DB->Query(
            $Table['pihak'],
            array(
                'coa',
                'coa_kode',
                'coa_nama'
            ),
            "
                WHERE
                    company = '" . $company . "' AND
                    pihakketiga = '" . $customer . "' AND
                    pihakketiga_tipe = 3
                LIMIT
                    1
            "
        ));

        $return['data'][$i]['coa'] = $Detail['coa'];
        $return['data'][$i]['coa_kode'] = $Detail['coa_kode'];
        $return['data'][$i]['coa_nama'] = $Detail['coa_nama'];

        $i++;
    }
}
//=> / END : Extract Reff

echo Core::ReturnData($return);
?>