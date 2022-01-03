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
    'grup'        => 'downtime_grup',
    'dt'          => 'downtime',
    'jo'          => 'jo',
    'detail'      => 'jo_detail',
    'bom'         => 'bom'
);

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
            if($GetStock['stock'] <= 0){
                $GetStock['stock'] = 0;
            }
            //=> / END : Check Stock Minus

            if($Detail['tipe'] == 1){
                $return['JO']['material'][$im] = $Detail;
                $return['JO']['material'][$im]['stock'] = $GetStock['stock'];
                $return['JO']['material'][$im]['price'] = $GetStock['price'];

                $im++;
            }elseif($Detail['tipe'] == 2){
                $return['JO']['output'][$io] = $Detail;
                $return['JO']['output'][$io]['stock'] = $GetStock['stock'];
                $return['JO']['output'][$io]['stock_def'] = $GetStock['stock'];
                $return['JO']['output'][$io]['price'] = $GetStock['price'];

                $io++;
            }elseif($Detail['tipe'] == 3){
                $return['JO']['utility'][$iu] = $Detail;
                $return['JO']['utility'][$iu]['stock'] = $GetStock['stock'];
                $return['JO']['utility'][$iu]['price'] = $GetStock['price'];

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
        while($BomItem = $DB->Result($Q_BomItem)){

            $return['bom'][$i_bom] = $BomItem;
            $return['bom'][$i_bom]['qty'] = $BomItem['qty'];
            $return['bom'][$i_bom]['in_decimal'] = $BomItem['in_decimal'];

            /**
             * Get Stock
             */
            $Stock = App::GetStockItem(array(
                'company'   => DEF['company'],
                'storeloc'  => $Data['storeloc'],
                'item'      => $BomItem['id']
            ));

            /**
             * Check Stock Minus
             */
            if($Stock['stock'] <= 0){
                $Stock['stock'] = 0;
            }
            //=> / END : Check Stock Minus

            $return['bom'][$i_bom]['stock'] = $Stock['stock'];
            $return['bom'][$i_bom]['price'] = $Stock['price'];
            //=> / END : Get Stock

            $i_bom++;
        }
    }
    //=> / END : Get Material by Bom

}
// => ENd Load JO

/**
 * Load Downtime
 */
$Q_Data = $DB->Query(
    $Table['grup'],
    array(
        'id' => 'grup',
        'kode',
        'nama'
    )
    
);
$R_Data = $DB->Row($Q_Data);
if($R_Data > 0){

    $i = 0;
    while($Data = $DB->Result($Q_Data)){
        
        $return['downtime'][$i] = $Data;

        $Q_Detail = $DB->Query(
            $Table['dt'],
            array(
                'id',
                'kode',
                'nama'
            ),
            "
                $CLAUSE
                AND
                    grup = '".$Data['grup']."'
            "
        );
        $R_Detail = $DB->Row($Q_Detail);
        if($R_Detail > 0){
            $j = 0;
            while($Detail = $DB->Result($Q_Detail)){

                $return['downtime'][$i]['detail'][$j] = $Detail;

                $j++;
            }
        } 

        $i++;
    }
}
//=> / END : Load Downtime

echo Core::ReturnData($return);
?>