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
    'def'       => 'prd_tf',
    'detail'    => 'prd_tf_detail',
    'jo'        => 'jo',
    'storeloc'  => 'storeloc',
    'stock'     => 'storeloc_stock',
    'deliver'   => 'prd_tf_deliver'
);

$CLAUSE = "
    WHERE
        id != '' AND
";

/**
 * Load MTR
 */
$Q_Data = $DB->Query(
    $Table['def'],
    array(
        'id',
        'company',
        'company_abbr',
        'dept',
        'dept_abbr',
        'kode',
        'jo',
        'jo_kode',
        'remarks'   => 'note'
    ),
    "
    $CLAUSE

    id = '" .$id. "'
    "

);
$R_Data = $DB->Row($Q_Data);
if($R_Data > 0){

    $Data = $DB->Result($Q_Data);

    $return['MTR'] = $Data;

    /**
     * Get Storeloc Target
     */
    $JO_Store = $DB->Result($DB->Query(
        $Table['jo'],
        array(
            'storeloc',
            'storeloc_kode',
            'storeloc_nama',
            'finish',
            'bom',
            'bom_kode'
        ),
        "
            WHERE
                id = '".$Data['jo']."'
        "
    ));

    $return['MTR']['storeloc'] = $JO_Store['storeloc'];
    $return['MTR']['storeloc_kode'] = $JO_Store['storeloc_kode'];
    $return['MTR']['storeloc_nama'] = $JO_Store['storeloc_nama'];
    $return['MTR']['finish'] = $JO_Store['finish'];
    $return['MTR']['bom'] = $JO_Store['bom'];
    $return['MTR']['bom_kode'] = $JO_Store['bom_kode'];
    // => End Get Storeloc Target

    /**
     * Get Header Total Received
     */
    $Q_Received = $DB->Query(
        $Table['deliver'],
        array(
            'id'
        ),
        "
            WHERE
                prd = '" . $Data['id'] . "'
        "
    );
    $HeaderReceived = "";
    $HeaderReceivedComma = "";

    $R_Received = $DB->Row($Q_Received);
    if($R_Received > 0){
        while($Received = $DB->Result($Q_Received)){
            $HeaderReceived .= $HeaderReceivedComma . $Received['id'];
            $HeaderReceivedComma = ",";
        }
    }
    //=> / END : Get Header Total Received

    // $return['header'] = $HeaderReceived;
    
    /**
     * Extract Detail
     */
    $Q_Detail = $DB->QueryPort("
        SELECT
            D.item AS id,
            D.qty AS qty_ref,
            TRIM(I.nama) AS nama,
            I.satuan,
            D.tipe,
            D.qty_receive,
            I.kode,
            I.in_decimal
        FROM
            item AS I,
            " . $Table['detail'] . " AS D
        WHERE
            D.header = '" . $Data['id'] . "' AND
            D.item = I.id AND
            D.qty > 0
        ORDER BY
            tipe ASC
    ");
    $R_Detail = $DB->Row($Q_Detail);
    if($R_Detail > 0){
        $im = 0;
        $io = 0;
        while($Detail = $DB->Result($Q_Detail)){

            /**
             * Get Detail Received
             * 
             * by prd_tf and item id
             */
            if(!empty($HeaderReceived)){
                $Q_DReceived = $DB->Query(
                    $Table['deliver'] . '_detail',
                    array(
                        'SUM(qty)' => 'total_qty_delivered',
                        'SUM(qty_receive)' => 'total_qty_received'
                    ),
                    "
                        WHERE
                            header IN (" . $HeaderReceived . ") AND 
                            item = '" . $Detail['id'] . "'
                        GROUP BY
                            item
                    "
                );
                $R_DReceived = $DB->Row($Q_DReceived);
                if($R_DReceived > 0){
                    $DReceived = $DB->Result($Q_DReceived);

                    $Detail['total_qty_delivered'] = $DReceived['total_qty_delivered'];
                    $Detail['total_qty_received'] = $DReceived['total_qty_received'];
                }
            }
            //=> / END : Get Detail Received

            $Q_SStock = $DB->QueryPort("
                SELECT
                    D.storeloc,
                    D.storeloc_kode,
                    H.nama AS storeloc_nama,
                    D.stock,
                    D.price
                FROM
                    " . $Table['storeloc'] . " AS H,
                    " . $Table['stock'] . " AS D
                WHERE
                    D.storeloc = H.id AND
                    D.company = '" . $Data['company'] . "' AND 
                    D.item = '" . $Detail['id'] . "' AND 
                    D.stock > 0 AND 
                    D.storeloc != '" . $JO_Store['storeloc'] . "'
            ");

            if($Detail['tipe'] == 1){

                $return['MTR']['material'][$im] = $Detail;
                
                $j = 0;
                while($SStock = $DB->Result($Q_SStock)){

                    $return['MTR']['material'][$im]['storeloc_list'][$j] = $SStock;

                    $j++;
                }

                $im++;

            }elseif($Detail['tipe'] == 4){

                $return['MTR']['list'][$io] = $Detail;

                $j = 0;
                while($SStock = $DB->Result($Q_SStock)){

                    $return['MTR']['list'][$io]['storeloc_list'][$j] = $SStock;

                    

                    $j++;

                }

                $io++;
            }

        }

    }
    //=> / END : Extract Detail

    /**
     * Calculate Progress
     */
    // $Q_Progress = $DB->QueryPort("
    //     SELECT
    //         D.header,
    //         sum(D.qty_ref) total,
    //         sum(D.qty_receive) total_receive
    //     FROM
    //         prd_tf_deliver T,
    //         prd_tf_deliver_detail D 
    //     WHERE
    //         T.prd = '" . $Data['id'] . "' AND
    //         T.id = D.header
    //     GROUP BY
    //         header
    // ");
    // $R_Progress = $DB->Row($Q_Progress);

    // if($R_Progress > 0){

    //     $Progress = $DB->Result($Q_Progress);

    //     // $return['MTR']['total_qty'] = $Progress['total'];
    //     // $return['MTR']['total_receive'] = $Progress['total_receive']; 

    //     if($Progress['total']){
    //         $return['MTR']['total_qty'] = (int)$Progress['total'];
    //     }else{
    //         $return['MTR']['total_qty'] = 0;
    //     }

    //     if($Progress['total_receive']){
    //         $return['MTR']['total_receive'] = (int)$Progress['total_receive']; 
    //     }else{
    //         $return['MTR']['total_receive'] = 0; 
    //     }
    // }
    //=> END : Calculate Progress

    /**
     * Get Total Request
     */
    $TotalReq = $DB->Result($DB->Query(
        $Table['def'] . "_detail",
        array(
            "SUM(qty)" => "total"
        ),
        "
            WHERE
                header = '" . $Data['id'] . "'
        "
    ));
    $return['MTR']['total_qty'] = $TotalReq['total'];
    //=> / END : Get Total Request

    /**
     * Get Total Received
     */
    $Q_Deliver = $DB->Query(
        $Table['def'] . '_deliver',
        array(
            'id'
        ),
        "
            WHERE 
                prd = '" . $Data['id'] . "' AND 
                approved_rcv = 1
        "
    );
    $R_Deliver = $DB->Row($Q_Deliver);
    if($R_Deliver > 0){
        $IDsDeliver = "";
        $IDsDeliverComma = "";
        while($Deliver = $DB->Result($Q_Deliver)){
            $IDsDeliver .= $IDsDeliverComma . $Deliver['id'];
            $IDsDeliverComma = ",";
        }

        $TotalRec = $DB->Result($DB->Query(
            $Table['def'] . "_deliver_detail",
            array(
                "SUM(qty_receive)" => "total"
            ),
            "
                WHERE
                    header IN (" . $IDsDeliver . ")
            "
        ));
        $TotalRec = $TotalRec['total'];
    }else{
        $TotalRec = 0;
    }
    $return['MTR']['total_receive'] = $TotalRec;
    //=> / END : Get Total Received
}
// => End Load MTR

echo Core::ReturnData($return);
?>