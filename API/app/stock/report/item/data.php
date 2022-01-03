<?php
$Modid = 34;

Perm::Check($Modid, 'view');

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
    'stock'     => 'stock'
);

// $fdari = stddate($fdari, "/");
// $fhingga = stddate($fhingga, "/");

$CLAUSE = $CLAUSE2 = $CLAUSE3 = "";

$CLAUSE .= "
    AND tanggal >= '" . $fdari . "' AND  tanggal <= '" . $fhingga . "'
";

if(!empty($company)){
    $CLAUSE .= "
        AND company = $company
    ";
    $CLAUSE2 .= "
        AND S.company = $company
    ";
    $CLAUSE3 .= "
        AND company = $company
    ";
}
if(!empty($storeloc)){
    $CLAUSE .= "
        AND storeloc = $storeloc
    ";
    $CLAUSE2 .= "
        AND S.storeloc = $storeloc
    ";
    $CLAUSE3 .= "
        AND storeloc = $storeloc
    ";
}

// $Check = $DB->Row($DB->Query(
//     $Table['stock'],
//     array(
//         'id'
//     ),
//     "
//         WHERE
//             id != ''
//             $CLAUSE
//     "
// ));

// if($Check > 0){
    
    $Q_Data = $DB->QueryPort("
    (
        SELECT
            item AS id,
            item_nama AS nama,
            item_kode AS kode,
            item_satuan AS satuan,
            saldo,
            SUM(debit) AS debit,
            SUM(credit) AS credit,
            1 AS is_stock
        FROM
            stock
        WHERE
            item != ''
            $CLAUSE
        GROUP BY
            item
    )
    UNION 
    (	
        SELECT
            I.id AS id,
            TRIM(I.nama) AS nama,
            I.kode AS kode,
            I.satuan AS satuan,
            SUM(S.stock) AS saldo,
            0 AS debit,
            0 AS credit, 
            NULL AS is_stock
        FROM
            storeloc_stock AS S,
            item AS I
        WHERE 
            S.id != '' AND 
            S.item = I.id AND
            S.item NOT IN (
                SELECT
                    item
                FROM
                    stock
                WHERE
                    id != ''
                    $CLAUSE
                GROUP BY
                    item
            )
            $CLAUSE2
        GROUP BY
            S.item
    )
    ORDER BY 
        kode ASC
    ");
    $R_Data = $DB->Row($Q_Data);

    if($R_Data > 0){
        $no = 1;
        $i = 0;
        while($Data = $DB->Result($Q_Data)){

            $return['data'][$i] = $Data;
            $return['data'][$i]['no'] = $no;

            /**
             * Saldo Awal
             */
            // if(!empty($Data['is_stock'])){
            //     $SaldoAwal = 0;
            //     $Q_SA = $DB->Query(
            //         $Table['stock'],
            //         array(
            //             'saldo'
            //         ),
            //         "
            //             WHERE
            //                 item = '" . $Data['id'] . "'
            //                 $CLAUSE
            //             ORDER BY
            //                 create_date ASC
            //         "
            //     );
            //     $R_SA = $DB->Row($Q_SA);
            //     if($R_SA > 0){
            //         $SA = $DB->Result($Q_SA);
            //         $SaldoAwal = $SA['saldo'];
            //     }
            //     $return['data'][$i]['saldo'] = $SaldoAwal;
            // }

            if(!empty($Data['is_stock'])){
                $return['data'][$i]['saldo'] = App::GetOpeningStockLedger(array(
                    'company'   => $company,
                    'storeloc'  => $storeloc,
                    'item'      => $Data['id'],
                    'tanggal'   => $fdari
                ));
            }else{

                /**
                 * Define Tanggal
                 */
                $GetYear = date("Y", strtotime($fdari));
                $GetMonth = date("n", strtotime($fdari));
                $Awal = $GetYear . '-' . $GetMonth . '-01';
                //=> / END : Define Tanggal

                /**
                 * Check current month
                 */
                $Q_Current = $DB->Query(
                    $Table['stock'],
                    array(
                        'id'
                    ),
                    "
                        WHERE
                            tanggal LIKE '" . $GetYear . "-" . $GetMonth . "-" . "%' AND 
                            item = '" . $Data['id'] . "'
                            $CLAUSE3
                    "
                );
                $R_Current = $DB->Row($Q_Current);
                if($R_Current > 0){
                    $return['data'][$i]['saldo'] = App::GetOpeningStockLedger(array(
                        'company'   => $company,
                        'storeloc'  => $storeloc,
                        'item'      => $Data['id'],
                        'tanggal'   => $fdari
                    ));
                }
                //=> / END : Check Current Month

            }

            //=> / END : Saldo Awal

            /**
             * Saldo Akhir
             */
            // if(!empty($Data['is_stock'])){
            //     $SaldoAkhir = 0;
            //     $Q_SA = $DB->Query(
            //         $Table['stock'],
            //         array(
            //             'SUM(saldo_akhir)'  => 'saldo_akhir'
            //             // 'saldo_akhir'
            //         ),
            //         "
            //             WHERE
            //                 id IN (
            //                     SELECT 
            //                         MAX(id)
            //                     FROM 
            //                         stock
            //                     WHERE
            //                         item = '" . $Data['id'] . "'
            //                         $CLAUSE
            //                     GROUP BY
            //                         storeloc,
            //                         item
            //                 )
            //                 $CLAUSE
            //             ORDER BY
            //                 create_date DESC,
            //                 id DESC
            //         "
            //     );
            //     $R_SA = $DB->Row($Q_SA);
            //     if($R_SA > 0){
            //         $SA = $DB->Result($Q_SA);
            //         $SaldoAkhir = $SA['saldo_akhir'];
            //     }
            //     $return['data'][$i]['saldo_akhir'] = $SaldoAkhir;
            // }
            //=> / END : Saldo Akhir

            $no++;
            $i++;
        }

    }
// }

echo Core::ReturnData($return);
//echo json_encode($return);

/*array_walk_recursive( $return, function(&$item) { 
    $item = mb_convert_encoding( $item, 'UTF-8' ); 
    //$item = htmlspecialchars(html_entity_decode($item, ENT_QUOTES, 'UTF-8'), ENT_QUOTES, 'UTF-8');
});
echo json_encode($return);*/
?>