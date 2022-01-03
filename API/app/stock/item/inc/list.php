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

/**
 * Check Storeloc Stock
 */
$Q_S = $DB->Query(
    $Table['sstock'],
    array(
        'item'
    ),
    "
        WHERE
            company = '" . $company . "' AND 
            storeloc = '" . $storeloc . "'
    "
);
$R_S = $DB->Row($Q_S);
if($R_S > 0){
    $SS = [];
    while($S = $DB->Result($Q_S)){
        $SS[] = $S['item'];
    }

    if(!empty($SS)){
        $CLAUSE .= "
            AND id NOT IN (" . implode(",", $SS) . ")
        ";
    }
}
//=> / END : Check Storeloc Stock

/**
 * Check Initial Stock
 */
$Q_S = $DB->QueryPort("
    SELECT
        I.company,
        I.storeloc,
        I.storeloc_kode,
        D.item,
        D.qty
    FROM
        initial_stock AS I,
        initial_stock_detail AS D
    WHERE
        D.header = I.id AND 
        I.company = '" . $company . "' AND 
        I.storeloc = '" . $storeloc . "'
");
$R_S = $DB->Row($Q_S);
if($R_S > 0){
    $SS = [];
    while($S = $DB->Result($Q_S)){
        $SS[] = $S['item'];
    }

    if(!empty($SS)){
        $CLAUSE .= "
            AND id NOT IN (" . implode(",", $SS) . ")
        ";
    }
}
//=> / END : Check Initial Stock

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
            'kode',
            'kode_old',
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

        $i++;
    }
}
//=> / END : Extract Data

echo Core::ReturnData($return);
?>