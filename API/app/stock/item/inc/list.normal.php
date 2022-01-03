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
    'def'       => 'item',
    'sstock'    => 'storeloc_stock'
);

/**
 * Filter
 */
$CLAUSE = "
    WHERE 
        id != '' AND
        status = 1
";

$QSql = $QSqlClause = "";
if(isset($keyword)){
    $Search = Search::Create(
        $keyword,
        array(
            'kode',
            'nama2' => 'nama',
            'grup_nama',
            'satuan',
            'description'
        ),
        array(
            5,
            4,
            3,
            2,
            1
        )
    );

    if(!empty($Search['query'])){
        $QSql = "," . $Search['query'];
        $QSqlClause = $Search['having'];
    }
}
//=> / END : Filter

/**
 * Extract Data
 */
$Q_Data = $DB->Query(
    $Table['def'],
    array('id'),
    $CLAUSE
);
$R_Data = $DB->Row($Q_Data);
if($R_Data > 0){

    $ORDER = "ORDER BY nama ASC";
    if(!empty($QSql)){
        $ORDER = "ORDER BY relevance DESC";
    }

    $Q_Data = $DB->Query(
        $Table['def'],
        array(
            'id',
            'item_type',
            'sub_item_type',
            'kode',
            'TRIM(nama2)'        => 'nama',
            'satuan',
            'in_decimal' . $QSql
        ),
        $CLAUSE . 
        $QSqlClause . 
        $ORDER .
        "
            LIMIT 100
        "
    );

    $i = 0;
    while($Data = $DB->Result($Q_Data)){
        $return[$i] = $Data;

        $Val['stock'] = 0;
        $Val['price'] = 0;
        // if(!empty($company) && !empty($storeloc)){
        if(!empty($company) && empty($storeloc)){
            $Stock = App::GetStockAll(array(
                'company'       => $company,
                // 'storeloc'      => $storeloc,
                'item'          => $Data['id']
            ));

            $Val['stock'] = $Stock;
        }else
        if(!empty($company) && !empty($storeloc)){
            $Stock = App::GetStockItem(array(
                'company'       => $company,
                'storeloc'      => $storeloc,
                'item'          => $Data['id']
            ));

            $Val['stock'] = $Stock['stock'];
            $Val['price'] = $Stock['price'];
        }

        $return[$i]['stock'] = $Val['stock'];
        $return[$i]['price'] = $Val['price'];

        $i++;
    }
}
//=> / END : Extract Data

echo Core::ReturnData($return);
?>