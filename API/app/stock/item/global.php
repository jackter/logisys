<?php
set_time_limit(0);

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
    'def'      => 'item_global'
);

/**
 * Filter
 */
$CLAUSE = "
    WHERE 
        clone = 0 AND 
        status = 1
";

$QSql = $QSqlClause = "";
if(isset($keyword)){
    $Search = Search::Create(
        $keyword,
        array(
            'kode',
            'nama',
            'unit',
        ),
        array(
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
$Q_Data = $DB->QueryOn(
    DB['master'],
    $Table['def'],
    array('id'),
    $CLAUSE . "
        LIMIT 50
    "
);
$R_Data = $DB->Row($Q_Data);
if($R_Data > 0){

    $ORDER = "ORDER BY nama ASC";
    if(!empty($QSql)){
        $ORDER = "ORDER BY relevance DESC";
    }

    $Q_Data = $DB->QueryOn(
        DB['master'],
        $Table['def'],
        array(
            'id',
            'kode',
            'TRIM(CHAR(9) FROM TRIM(nama))'        => 'nama',
            'unit' . $QSql
        ),
        $CLAUSE . 
        $QSqlClause . 
        $ORDER .
        "
            LIMIT 50
        "
    );

    while($Data = $DB->Result($Q_Data)){
        $return[] = $Data;
    }
}
//=> / END : Extract Data*/

echo Core::ReturnData($return);
?>