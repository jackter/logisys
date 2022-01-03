<?php
$Modid = 24;

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
    'def'           => 'item',
    'm_item'        => 'purchaseitem'
);

//=> Clean Data
if(empty($limit)){
    $limit = 10;
}
if(empty($offset)){
    $offset = 0;
}

/**
 * Filter
 */
$CLAUSE = "
    WHERE 
        id != ''
";

$QSql = $QSqlClause = "";
//=> / END : Filter

/**
 * Filter Table
 */
$ftable = json_decode($ftable, true);
if(isset($ftable)){
    /*$SearchKey = [];
    $SearchKeywords = $SearchComma = "";
    $SearchScore = [];

    $i = 1;*/
    foreach($ftable AS $Key => $Val){

        /**
         * Generate Clause
         */
        switch($Key){

            case "nama": 
                // $CLAUSE .= "
                //     AND CONCAT(
                //         nama,
                //         IF(
                //             specifications IS NOT NULL || specifications != '',
                //             CONCAT(' ', specifications),
                //             ''
                //         ),
                //         IF(
                //             size IS NOT NULL || size != '',
                //             CONCAT(' ', size),
                //             ''
                //         ),
                //         IF(
                //             part_no IS NOT NULL || part_no != '',
                //             CONCAT(' ', part_no),
                //             ''
                //         ),
                //         IF(
                //             brand IS NOT NULL || brand != '',
                //             CONCAT(' ', brand),
                //             ''
                //         ),
                //         IF(
                //             model IS NOT NULL || model != '',
                //             CONCAT(' ', model),
                //             ''
                //         ),
                //         IF(
                //             serial_no IS NOT NULL || serial_no != '',
                //             CONCAT(' ', serial_no),
                //             ''
                //         ),
                //         IF(
                //             tag_no IS NOT NULL || tag_no != '',
                //             CONCAT(' ', tag_no),
                //             ''
                //         )
                //     ) LIKE '%" . $Val['filter'] . "%'
                // ";
                $CLAUSE .= "
                    AND nama2 LIKE '%" . $Val['filter'] . "%'
                ";
                break;

            default:
                $CLAUSE .= "
                    AND 
                        $Key LIKE '%" . $Val['filter'] . "%'                    
                ";
                /*$SearchKeywords = $SearchComma . $Val['filter'];
                $SearchComma = " ";
                $SearchKey[] = $Key;
                $SearchScore[] = $i;

                $i++;*/
        }
        //=> / END : Generate Clause

        /*$return['ftable'] = $Val;
        $return['clause'] = $CLAUSE;*/
    }

    /*if(sizeof($SearchKey) > 0){
        $Search = Search::Create(
            $SearchKeywords,
            $SearchKey,
            $SearchScore
        );

        $QSql = "," . $Search['query'];
        $QSqlClause = $Search['having'];

        $return['keyword'] = $SearchKeywords;
        $return['key'] = $SearchKey;
        $return['score'] = $SearchScore;
    }*/
}
//=> / END : Filter Table

/**
 * Listing Data
 */
$return['start']        = 0;
$return['limit']        = $limit;
$return['count']        = 0;

$Q_Data = $DB->Query(
    $Table['def'],
    array('id' . $QSql),
    $CLAUSE . 
    $QSqlClause
);
$R_Data = $DB->Row($Q_Data);

if($R_Data > 0){

    $return['start']        = $start;
    $return['limit']        = $limit;
    $return['count']        = $R_Data;

    $ORDER = "ORDER BY TRIM(kode) ASC";
    if(!empty($QSql)){
        $ORDER = "ORDER BY relevance DESC";
    }

    $Q_Data = $DB->Query(
        $Table['def'],
        array(
            'id',
            'item_type',
            'kode',
            'kode_old',
            'nama2' => 'nama',
            // "
            //     CONCAT(
            //         nama,
            //         IF(
            //             specifications IS NOT NULL || specifications != '',
            //             CONCAT('; Spec: ', specifications),
            //             ''
            //         ),
            //         IF(
            //             size IS NOT NULL || size != '',
            //             CONCAT('; Size: ', size),
            //             ''
            //         ),
            //         IF(
            //             part_no IS NOT NULL || part_no != '',
            //             CONCAT('; Part No.: ', part_no),
            //             ''
            //         ),
            //         IF(
            //             brand IS NOT NULL || brand != '',
            //             CONCAT('; Brand: ', brand),
            //             ''
            //         ),
            //         IF(
            //             model IS NOT NULL || model != '',
            //             CONCAT('; Model: ', model),
            //             ''
            //         ),
            //         IF(
            //             serial_no IS NOT NULL || serial_no != '',
            //             CONCAT('; Serial: ', serial_no),
            //             ''
            //         ),
            //         IF(
            //             tag_no IS NOT NULL || tag_no != '',
            //             CONCAT('; Tag No.: ', tag_no),
            //             ''
            //         )
            //     )
            // " => 'nama',
            'specifications',
            'size',
            'part_no',
            'brand',
            'model',
            'serial_no',
            'tag_no',
            'verified',
            'status',
            'suspend_remarks',
            'satuan' . $QSql
        ),
        $CLAUSE . 
        $QSqlClause . 
        $ORDER . 
        "
            LIMIT 
                $offset, $limit
        "
    );

    $i = 0;
    while($Data = $DB->Result($Q_Data)){

        $return['data'][$i] = $Data;

        $Stock = App::GetStock(array(
            'item'  => $Data['id']
        ));
        $return['data'][$i]['stock'] = $Stock;

        $i++;
    }

}else{

}
//=> / END : Listing Data

echo Core::ReturnData($return);
?>