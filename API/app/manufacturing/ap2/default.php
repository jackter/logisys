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
    'def'         => 'actual_production',
    'grup'        => 'downtime_grup',
    'dt'          => 'downtime',
    'jo'          => 'jo',
    'detail'      => 'jo_detail',
    'bom'         => 'bom'
);

/**
 * Function
 */
function GetTotal($item){
    global $Table;
    global $DB;
    global $id;

    $Total = 0;

    // $Q_Data = $DB->Query(
    //     $Table['def'] . "_detail",
    //     array(
    //         'SUM(qty)'  => 'total'
    //     ),
    //     "
    //         WHERE
    //             item = $Options[item]
    //         GROUP BY
    //             item 
    //     "
    // );
    // $R_Data = $DB->Row($Q_Data);
    // if($R_Data > 0){
    //     $Data = $DB->Result($Q_Data);

    //     $Total = $Data['total'];
    // }

    /**
     * Calculate Progress
     */
    $Q_Data = $DB->QueryPort("
        SELECT
            SUM(qty) AS total_qty
        FROM
            " . $Table['def'] . " H, 
            " . $Table['def'] . "_detail D
        WHERE
            D.header = H.id AND 
            H.jo = '" . $id. "' AND 
            D.item = '" . $item . "' AND 
            H.approved = 1
        GROUP BY
            item
    ");
    $R_Data = $DB->Row($Q_Data);
    if($R_Data > 0){
        $Data = $DB->Result($Q_Data);

        $Total = $Data['total_qty'];

        // $Data['total_actual_production'] = $SR['total_qty'];
    }
    //=> / END : Calculate Progress

    return $Total;
}
//=> / END : Function Get Total

$CLAUSE = "
    WHERE
        id != ''
";

/**
 * Load JO
 */
$Q_Data = $DB->Query(
    $Table['jo'],
    array(
        'id'            => 'jo',
        'kode'          => 'jo_kode',
        'description',
        'company',
        'company_abbr',
        'company_nama',
        'dept',
        'dept_abbr',
        'dept_nama',
        'storeloc',
        'storeloc_kode',
        'storeloc_nama',
        'plant',
        'bom',
        'bom_kode',
        'shift_rate',
        'running_hours',
        'qty',
        'finish'
    ),
    "
        WHERE id = '" . $id . "'
    "
);
$R_Data = $DB->Row($Q_Data);
if($R_Data > 0){
    $Data = $DB->Result($Q_Data);

    $return['JO'] = $Data;

    /**
     * Extract Detail
     */
    $Q_Detail = $DB->QueryPort("
        SELECT
            D.item AS id,
            D.ref_qty AS qty_bom,
            D.qty AS qty_jo,
            TRIM(I.nama) AS nama,
            I.satuan,
            D.tipe,
            I.kode,
            I.in_decimal,
            I.is_fix,
            I.fix_price,
            D.persentase
        FROM
            item AS I,
            " . $Table['detail'] . " AS D
        WHERE
            D.header = '" . $id . "' AND
            D.item = I.id
        ORDER BY
            tipe ASC
    ");
    $R_Detail = $DB->Row($Q_Detail);
    if($R_Detail > 0){
        $im = 0;
        $io = 0;
        $iu = 0;

        while($Detail = $DB->Result($Q_Detail)){


            $GetStock = App::GetStockItem(array(
                'company'   => DEF['company'],
                'storeloc'  => $Data['storeloc'],
                'item'      => $Detail['id']
            ));

            /**
             * Check Stock Minus
             */
            // if($GetStock['stock'] <= 0){
            //     $GetStock['stock'] = 0;
            // }
            //=> / END : Check Stock Minus

            if($Detail['tipe'] == 1){
                $return['JO']['material'][$im] = $Detail;
                // $return['data']['material'][$im]['storeloc_list'] = getStockByDetail($Data, $Detail);
                $return['JO']['material'][$im]['stock'] = $GetStock['stock'];
                // $return['JO']['material'][$im]['price'] = $GetStock['price'];

                // $return['JO']['material'][$im]['total'] = $Total;

                $im++;
            }elseif($Detail['tipe'] == 2){
                $return['JO']['output'][$io] = $Detail;
                $return['JO']['output'][$io]['stock'] = $GetStock['stock'];
                // $return['JO']['output'][$io]['stock_def'] = $GetStock['stock'];
                // $return['JO']['output'][$io]['price'] = $GetStock['price'];

                // $return['JO']['output'][$io]['total'] = $Total;

                $io++;
            }elseif($Detail['tipe'] == 3){
                $return['JO']['utility'][$iu] = $Detail;
                $return['JO']['utility'][$iu]['stock'] = $GetStock['stock'];
                // $return['JO']['utility'][$iu]['price'] = $GetStock['price'];

                // $return['JO']['utility'][$iu]['total'] = $Total;

                $iu++;
            }

        }

    }
    //=> / END : Extract Detail

    /**
     * Get Material by Bom
     */
    $Q_BomItem = $DB->QueryPort("
        SELECT
            D.id AS detail_id,
            D.item AS id,
            D.qty,
            D.tipe,
            I.kode AS kode,
            TRIM(I.nama) AS nama,
            I.satuan,
            I.in_decimal
        FROM
            item AS I,
            " . $Table['bom'] . "_detail AS D
        WHERE
            D.header = '" . $Data['bom'] . "' AND
            D.item = I.id AND 
            (
                D.tipe = 1 OR
                D.tipe = 2
            )
    ");
    $R_BomItem = $DB->Row($Q_BomItem);
    if($R_BomItem > 0){
        $i_bom = 0;

        $BOM = array();
        $IDsBOM = $Comma = "";

        while($BomItem = $DB->Result($Q_BomItem)){

            $Total = GetTotal($BomItem['id']);

            $BOM[$i_bom] = $BomItem;
            $BOM[$i_bom]['qty'] = $BomItem['qty'];
            $BOM[$i_bom]['in_decimal'] = $BomItem['in_decimal'];

            $BOM[$i_bom]['total'] = $Total;

            $IDsBOM .= $Comma . $BomItem['id'];
            $Comma = ",";

            if(
                $BomItem['tipe'] == 2 &&
                empty($return['JO']['current'])
            ){
                $return['JO']['current'] = $Total;
                $return['JO']['percent'] = ($Total / $return['JO']['qty']) * 100;
            }

            // /**
            //  * Get Stock
            //  */
            // $Stock = App::GetStockItem(array(
            //     'company'   => DEF['company'],
            //     'storeloc'  => $Data['storeloc'],
            //     'item'      => $BomItem['id']
            // ));

            // /**
            //  * Check Stock Minus
            //  */
            // if($Stock['stock'] <= 0){
            //     $Stock['stock'] = 0;
            // }
            // //=> / END : Check Stock Minus

            // $BOM[$i_bom]['stock'] = $Stock['stock'];
            // $BOM[$i_bom]['price'] = $Stock['price'];
            //=> / END : Get Stock

            $i_bom++;
        }

        /**
         * Merge Actual with BOM
         */
        $Q_Actual = $DB->QueryPort("
            SELECT
                SUM(qty) AS total,
                D.item AS id,
                D.qty,
                D.tipe,
                I.kode AS kode,
                TRIM(I.nama) AS nama,
                I.satuan,
                I.in_decimal
            FROM
                item AS I,
                " . $Table['def'] . " H, 
                " . $Table['def'] . "_detail D
            WHERE
                D.header = H.id AND 
                D.item = I.id AND 
                H.jo = '" . $id. "' AND 
                H.approved = 1 AND 
                D.item NOT IN ($IDsBOM)
            GROUP BY
                item
            ORDER BY 
                id ASC
        ");
        $R_Actual = $DB->Row($Q_Actual);
        if($R_Actual > 0){
            while($Actual = $DB->Result($Q_Actual)){
                $BOM[] = $Actual;
            }
        }
        //=> / END : Merge Actual with BOM

        $return['bom'] = $BOM;
    }
    //=> / END : Get Material by Bom

}
// => ENd Load JO

/**
 * Load Downtime
 */
// $Q_Data = $DB->Query(
//     $Table['grup'],
//     array(
//         'id' => 'grup',
//         'kode',
//         'nama'
//     )
    
// );
// $R_Data = $DB->Row($Q_Data);
// if($R_Data > 0){

//     $i = 0;
//     while($Data = $DB->Result($Q_Data)){
        
//         $return['downtime'][$i] = $Data;

//         $Q_Detail = $DB->Query(
//             $Table['dt'],
//             array(
//                 'id',
//                 'kode',
//                 'nama'
//             ),
//             "
//                 $CLAUSE
//                 AND
//                     grup = '".$Data['grup']."'
//             "
//         );
//         $R_Detail = $DB->Row($Q_Detail);
//         if($R_Detail > 0){
//             $j = 0;
//             while($Detail = $DB->Result($Q_Detail)){

//                 $return['downtime'][$i]['detail'][$j] = $Detail;

//                 $j++;
//             }
//         } 

//         $i++;
//     }
// }
//=> / END : Load Downtime

echo Core::ReturnData($return);
?>