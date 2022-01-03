<?php
$Modid = 64;

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
    'def'       => 'prd_tf',
    'detail'    => 'prd_tf_detail',
);

/**
 * Get Data
 */
$Q_Data = $DB->Query(
    $Table['def'],
    array(
        'id',
        'kode',
        'jo',
        'company',
        'jo_kode',
        'remarks'   => 'note',
        'verified',
        'approved'
    ),
    "
        WHERE id = '" . $id . "'
    "
);
$R_Data = $DB->Row($Q_Data);
if($R_Data > 0){
    $Data = $DB->Result($Q_Data);

    $return['data'] = $Data;

    /**
     * Extract Detail
     */
    $Q_Detail = $DB->QueryPort("
        SELECT
            D.item AS id,
            D.qty,
            TRIM(I.nama) AS nama,
            I.satuan,
            D.tipe,
            D.remarks,
            I.kode,
            I.in_decimal
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
        $ic = 0;
        while($Detail = $DB->Result($Q_Detail)){

            /**
             * Get St{ock
             */
            $GetStock = App::GetStockItem(array(
                'company'   => $Data['company'],
                'storeloc'  => $Data['storeloc'],
                'item'      => $Detail['id']
            ));
            //=> / END : Get Stock}

            if($Detail['tipe'] == 1){
                $return['data']['material'][$im] = $Detail;
                $return['data']['material'][$im]['stock'] = $GetStock['stock'];
                $return['data']['material'][$im]['price'] = $GetStock['price'];
                $im++;
            }elseif($Detail['tipe'] == 4){
                $return['data']['list'][$ic] = $Detail;
                $return['data']['list'][$ic]['stock'] = $GetStock['stock'];
                $return['data']['list'][$ic]['price'] = $GetStock['price'];
                $ic++;
            }

        }

        if(empty($is_detail) && !isset($is_detail)){
            // $return['data']['material'][$im] = array(
            //     'i' => 0
            // );
            $return['data']['list'][$ic] = array(
                'i' => 0
            );
        }
    }
    //=> / END : Extract Detail

}
//=> / END : Get Data

echo Core::ReturnData($return);
?>