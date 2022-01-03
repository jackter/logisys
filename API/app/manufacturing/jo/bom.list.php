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
    'def'        => 'bom',
    'detail'     => 'bom_detail'
);

$CLAUSE = "";
if($keyword != '' && isset($keyword)){
    $CLAUSE .= "
        AND  (kode LIKE '%" . $keyword . "%'
        OR description LIKE '%" . $keyword . "%')
    ";
}

/**
 * Get Data
 */
$Q_Data = $DB->Query(
    $Table['def'],
    array(
        'id',
        'kode',
        'storeloc',
        'storeloc_kode',
        'storeloc_nama',
        'plant',
        'description'
    ),
    "
        WHERE id != ''
        $CLAUSE
    "
);
$R_Data = $DB->Row($Q_Data);
if($R_Data > 0){
    
    $i = 0;
    while($Data = $DB->Result($Q_Data)){

        $return[$i] = $Data;
    
        /**
         * Extract Detail
         */
        $Q_Detail = $DB->QueryPort("
            SELECT
                D.item AS id,
                D.qty AS ref_qty,
                TRIM(I.nama) AS nama,
                I.satuan,
                tipe,
                kode
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
            $im = 0;
            $io = 0;
            $iu = 0;
    
            while($Detail = $DB->Result($Q_Detail)){
    
                if($Detail['tipe'] == 1){
                    $return[$i]['material'][$im] = $Detail;
                    $im++;
                }elseif($Detail['tipe'] == 2){
                    $return[$i]['output'][$io] = $Detail;
                    $io++;
                }elseif($Detail['tipe'] == 3){
                    $return[$i]['utility'][$iu] = $Detail;
                    $iu++;
                }
    
            }
    
            // if(!$is_detail){
            //     $return[$i]['material'][$im] = array(
            //         'i' => 0
            //     );
            //     $return[$i]['output'][$io] = array(
            //         'i' => 0
            //     );
            //     $return[$i]['utility'][$iu] = array(
            //         'i' => 0
            //     );
            // }
        }
        //=> / END : Extract Detail
        $i++;
    }


}
//=> / END : Get Data
echo Core::ReturnData($return);

?>