<?php
$Modid = 91;

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

$return['permissions'] = Perm::Extract($Modid);

$Table = array(
    'def'       => 'sr',
    'detail'    => 'sr_detail',
    'stock'     => 'stock',
    'jo'        => 'jo',
    'deliver'   => 'prd_tf_deliver'
);

$CLAUSE = "
    WHERE
        id != '' AND 
        approved = 1 AND
        tanggal BETWEEN '" . $fdari . "' AND '" . $fhingga . "'
";

// if(!empty($bom)){
//     $CLAUSE .= "
//         AND bom = '" . $bom . "' 
//     ";
// }

// $return['clause'] = $CLAUSE;

$Q_Data = $DB->Query(
    $Table['def'],
    array('id'),
    $CLAUSE
);
$R_Data = $DB->Row($Q_Data);

if($R_Data > 0){

    $Q_Data = $DB->Query(
        $Table['def'],
        array(
            'id',
            'kode',
            'jo',
            'jo_kode',
            'tanggal',
            'approved_date'
        ),
        $CLAUSE .
        "
            ORDER BY
                create_date DESC
        "
    );

    $i = 0;
    while($Data = $DB->Result($Q_Data)){

        $return['data'][$i] = $Data;

        $JO = $DB->Result($DB->Query(
            $Table['jo'],
            array(
                'company',
                'storeloc',
            ),
            "
                WHERE
                    id = '" . $Data['jo'] . "'
            "
        ));

        /**
         * Extract Detail
         */
        $Q_Detail = $DB->QueryPort("
        SELECT
            D.item AS id,
            TRIM(I.nama) AS nama,
            I.satuan,
            I.kode AS kode_item,
            D.qty
        FROM
            item AS I,
            " . $Table['detail'] . " AS D
        WHERE
            D.header = '" . $Data['id'] . "' AND
            D.item = I.id
        ORDER BY
            tipe ASC
        ");
        $R_Detail = $DB->Row($Q_Detail);
        if($R_Detail > 0){
            $j=0;
            while($Detail = $DB->Result($Q_Detail)){
                
                $return['data'][$i]['detail'][$j] = $Detail;
                $return['data'][$i]['detail'][$j]['kode'] =  $Data['kode'];

                /**
                 * Opening Stock
                 */
                // $Q_Open = $DB->Query(
                //     $Table['stock'],
                //     array(
                //         'saldo'
                //     ),
                //     "
                //         WHERE
                //             item = '" . $Detail['id'] . "' AND 
                //             create_date LIKE '" . date('Y-m-d', strtotime($Data['approved_date'])) . "%' AND 
                //             storeloc = '" . $JO['storeloc'] . "'
                //         ORDER BY
                //             create_date ASC
                //     "
                // );
                // $R_Open = $DB->Row($Q_Open);
                // if($R_Open > 0){
                //     $Open = $DB->Result($Q_Open);

                //     $return['data'][$i]['detail'][$j]['opening'] = $Open['saldo'];
                // }
                //=> / END : Opening Stock

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
                            item = '" . $Data['id'] . "' AND 
                            company = '" . $JO['company'] . "' AND 
                            storeloc = '" . $JO['storeloc'] . "'
                    "
                );
                $R_Current = $DB->Row($Q_Current);
                if($R_Current > 0){
                    $return['data'][$i]['detail'][$j]['opening'] = App::GetOpeningStockLedger(array(
                        'company'   => $JO['company'],
                        'storeloc'  => $JO['storeloc'],
                        'item'      => $Data['id'],
                        'tanggal'   => $fdari
                    ));
                }
                //=> / END : Check Current Month

                /**
                 * Get Total Receive
                 */
                $Q_Rcv = $DB->Query(
                    $Table['deliver'],
                    array(
                        'id'
                    ),
                    "
                        WHERE
                            tanggal = '" . $Data['tanggal'] . "'
                    "
                );
                $R_Rcv = $DB->Row($Q_Rcv);

                $RcvHeader = "";
                $RcvHeaderComma = "";
                if($R_Rcv > 0){
                    while($Rcv = $DB->Result($Q_Rcv)){
                        $RcvHeader .= $RcvHeaderComma . $Rcv['id'];
                        $RcvHeaderComma = ",";
                    }

                    $Q_RcvD = $DB->Query(
                        $Table['deliver'] . '_detail',
                        array(
                            'SUM(qty_receive)' => 'total_receive'
                        ),
                        "
                            WHERE
                                header IN (" . $RcvHeader . ") AND 
                                item = '" . $Detail['id'] . "'
                            GROUP BY
                                item
                        "
                    );
                    $R_RcvD = $DB->Row($Q_RcvD);
                    if($R_RcvD > 0){
                        $RcvD = $DB->Result($Q_RcvD);

                        $return['data'][$i]['detail'][$j]['receive'] = $RcvD['total_receive'];
                    }
                }
                //=> / END : Get Total Receive

                $j++;
            }
        }
        //=> End Extract Detail

        $i++;
    }

}

echo Core::ReturnData($return);
?>