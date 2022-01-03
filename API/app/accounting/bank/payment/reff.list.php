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
    'def'      => 'invoice',
    'def2'     => 'sp3',
    'pihak'    => 'pihakketiga_coa',
    'sp3jv'    => 'sp3_jv_detail',
);

$CLAUSE = "";
if($keyword != '' && isset($keyword)){
    $CLAUSE .= " 
        AND (kode LIKE '%" . $keyword . "%' OR
        kode LIKE '" . $keyword . "%')
    ";
}

if($supplier != '' && isset($supplier) && $reff_type == 1){
    $CLAUSE .= " 
        AND supplier = '" . $supplier . "'
    ";
}

if($pihak_ketiga != '' && isset($pihak_ketiga) && $reff_type == 4){
    $CLAUSE .= " 
        AND pihak_ketiga = '" . $pihak_ketiga . "'
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
if($reff_type == 1 && $supplier != '' && isset($supplier)){
    $Q_Reff = $DB->QueryPort("
        SELECT
            id,
            kode,
            tipe,
            po,
            case when customs = 1 then (amount - ppn_amount) else amount end AS amount,
            payment_amount,
            supplier
        FROM
            " . $Table['def'] . "
        WHERE
            status != 0 AND
            verified = 1 AND
            case when customs = 1 then payment_amount != (amount - ppn_amount) else payment_amount != amount end
            $CLAUSE
        ORDER BY
            kode ASC
        LIMIT
            100
    ");
}
else if($reff_type == 4 && $pihak_ketiga != '' && isset($pihak_ketiga)){
    $Q_Reff = $DB->QueryPort("
        SELECT
            id,
            kode,
            tipe,
            po,
            case when customs = 1 then (amount - ppn_amount) else amount end AS amount,
            payment_amount,
            supplier
        FROM
            " . $Table['def'] . "
        WHERE
            status != 0 AND
            verified = 1 AND
            case when customs = 1 then payment_amount != (amount - ppn_amount) else payment_amount != amount end
            $CLAUSE
        ORDER BY
            kode ASC
        LIMIT
            100
    ");
}
else if($reff_type == 2){
    $Q_Reff = $DB->Query(
        $Table['def2'],
        array(
            'id',
            'kode',
            'total' => 'amount',
            'pay_req_type',
            'payment_amount'
        ),
        "
            WHERE
                status != 0 AND
                approved = 1 AND
                (is_manual = 1 OR pay_req_type = 2) AND
                payment_amount != total
                $CLAUSE
            ORDER BY
                kode ASC
            LIMIT
                100
        "
    );
}
$R_Reff = $DB->Row($Q_Reff);
if($R_Reff > 0){
    $i = 0;
    while($Reff = $DB->Result($Q_Reff)){
        $return['data'][$i] = $Reff;

        if($reff_type == 1){
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
                        pihakketiga = '" . $supplier . "' AND
                        pihakketiga_tipe = 1
                    LIMIT
                        1
                "
            ));

            $return['data'][$i]['coa'] = $Detail['coa'];
            $return['data'][$i]['coa_kode'] = $Detail['coa_kode'];
            $return['data'][$i]['coa_nama'] = $Detail['coa_nama'];
        }
        else if($reff_type == 4){
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
                        pihakketiga = '" . $pihak_ketiga . "' AND
                        pihakketiga_tipe = '" . $pihakketiga_tipe . "'
                    LIMIT
                        1
                "
            ));

            $return['data'][$i]['coa'] = $Detail['coa'];
            $return['data'][$i]['coa_kode'] = $Detail['coa_kode'];
            $return['data'][$i]['coa_nama'] = $Detail['coa_nama'];
        }
        else{
            if($Reff['pay_req_type'] != 2){
                $Q_Detail = $DB->Query(
                    $Table['sp3jv'],
                    array(
                        'coa',
                        'coa_kode',
                        'coa_nama',
                        'credit'
                    ),
                    "
                        WHERE
                            header = '" . $return['data'][$i]['id'] . "' AND
                            credit > 0
                    "
                );
    
                $MaxDetail;
                
                $x = 0;
                while($Detail = $DB->Result($Q_Detail)){
                    if($x == 0){
                        $MaxDetail = $Detail;
                    }
                    else{
                        if($Detail['credit'] > $MaxDetail['credit']){
                            $MaxDetail = $Detail;
                        }
                    }
                    $x++;
                }
    
                $return['data'][$i]['coa'] = $MaxDetail['coa'];
                $return['data'][$i]['coa_kode'] = $MaxDetail['coa_kode'];
                $return['data'][$i]['coa_nama'] = $MaxDetail['coa_nama'];
            }
        }

        $i++;
    }
}
//=> / END : Extract Reff

echo Core::ReturnData($return);
?>