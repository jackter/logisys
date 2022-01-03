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
    'def'      => 'sp3',
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
$Q_Reff = $DB->Query(
    $Table['def'],
    array(
        'id',
        'kode',
        'total' => 'amount',
        'pay_req_type',
        'payment_amount',
        'penerima',
        'keterangan_bayar' => 'uraian'
    ),
    "
        WHERE
            status != 0 AND
            approved = 1 AND
            payment_amount != total
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

        $Q_Detail = $DB->QueryPort("
            SELECT
                tipe,
                tipe_pihak_ketiga,
                pihak_ketiga,
                pihak_ketiga_kode,
                pihak_ketiga_nama,
                supplier,
                supplier_kode,
                supplier_nama
            FROM
                invoice 
            WHERE
                sp3 = " . $Reff['id'] . "
        ");
        $R_Detail = $DB->Row($Q_Detail);

        if($R_Detail > 0){
            $Detail = $DB->Result($Q_Detail);

            $return['data'][$i]['tipe'] = $Detail['tipe'];

            if($Detail['tipe'] == 4){
                $return['data'][$i]['tipe_pihak_ketiga'] = $Detail['tipe_pihak_ketiga'];
                $return['data'][$i]['pihak_ketiga'] = $Detail['pihak_ketiga'];
                $return['data'][$i]['pihak_ketiga_kode'] = $Detail['pihak_ketiga_kode'];
                $return['data'][$i]['pihak_ketiga_nama'] = $Detail['pihak_ketiga_nama'];
            }
            else{
                $return['data'][$i]['supplier'] = $Detail['supplier'];
                $return['data'][$i]['supplier_kode'] = $Detail['supplier_kode'];
                $return['data'][$i]['supplier_nama'] = $Detail['supplier_nama'];
            }
            // $i = 0;
            // while($Detail = $DB->Result($Q_Detail)){

            //     $return['data']['detail'][$i] = $Detail;
            //     $return['data']['tipe'] = $Detail['tipe'];
            //     $i++;

            // }
        }

        // if($reff_type == 1){
        //     $Detail = $DB->Result($DB->Query(
        //         $Table['pihak'],
        //         array(
        //             'coa',
        //             'coa_kode',
        //             'coa_nama'
        //         ),
        //         "
        //             WHERE
        //                 company = '" . $company . "' AND
        //                 pihakketiga = '" . $supplier . "' AND
        //                 pihakketiga_tipe = 1
        //             LIMIT
        //                 1
        //         "
        //     ));

        //     $return['data'][$i]['coa'] = $Detail['coa'];
        //     $return['data'][$i]['coa_kode'] = $Detail['coa_kode'];
        //     $return['data'][$i]['coa_nama'] = $Detail['coa_nama'];
        // }
        // else if($reff_type == 4){
        //     $Detail = $DB->Result($DB->Query(
        //         $Table['pihak'],
        //         array(
        //             'coa',
        //             'coa_kode',
        //             'coa_nama'
        //         ),
        //         "
        //             WHERE
        //                 company = '" . $company . "' AND
        //                 pihakketiga = '" . $pihak_ketiga . "' AND
        //                 pihakketiga_tipe = '" . $pihakketiga_tipe . "'
        //             LIMIT
        //                 1
        //         "
        //     ));

        //     $return['data'][$i]['coa'] = $Detail['coa'];
        //     $return['data'][$i]['coa_kode'] = $Detail['coa_kode'];
        //     $return['data'][$i]['coa_nama'] = $Detail['coa_nama'];
        // }
        // else{
        //     if($Reff['pay_req_type'] != 2){
        //         $Q_Detail = $DB->Query(
        //             $Table['sp3jv'],
        //             array(
        //                 'coa',
        //                 'coa_kode',
        //                 'coa_nama',
        //                 'credit'
        //             ),
        //             "
        //                 WHERE
        //                     header = '" . $return['data'][$i]['id'] . "' AND
        //                     credit > 0
        //             "
        //         );
    
        //         $MaxDetail;
                
        //         $x = 0;
        //         while($Detail = $DB->Result($Q_Detail)){
        //             if($x == 0){
        //                 $MaxDetail = $Detail;
        //             }
        //             else{
        //                 if($Detail['credit'] > $MaxDetail['credit']){
        //                     $MaxDetail = $Detail;
        //                 }
        //             }
        //             $x++;
        //         }
    
        //         $return['data'][$i]['coa'] = $MaxDetail['coa'];
        //         $return['data'][$i]['coa_kode'] = $MaxDetail['coa_kode'];
        //         $return['data'][$i]['coa_nama'] = $MaxDetail['coa_nama'];
        //     }
        // }

        $i++;
    }
}
//=> / END : Extract Reff

echo Core::ReturnData($return);
?>