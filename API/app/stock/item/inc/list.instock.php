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
AND
    I.status = 1
";

$QSql = $QSqlClause = "";
if(isset($keyword)){
    $Search = Search::Create(
        $keyword,
        array(
            'I.kode',
            'I.nama2' => 'nama',
            'I.description'
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
 * Select Data
 */
$Q_Data = $DB->QueryPort("
    SELECT
        S.company,
        S.storeloc,
        I.kode,
        TRIM(I.nama2) AS nama,
        I.satuan,
        S.stock,
        S.price
        $QSql
    FROM
        storeloc_stock AS S,
        item AS I
    WHERE
        S.item = I.id AND 
        S.company = '" . $company . "' AND 
        S.storeloc = '" . $storeloc . "' AND 
        S.stock > 0
    $CLAUSE
    $QSqlClause
");
$R_Data = $DB->Row($Q_Data);
if($R_Data > 0){

    $ORDER = "ORDER BY I.kode ASC";
    if(!empty($QSql)){
        $ORDER = "ORDER BY relevance DESC";
    }

    $Q_Data = $DB->QueryPort("
        SELECT
            I.id AS id,
            S.company,
            S.storeloc,
            I.kode,
            TRIM(I.nama2) AS nama,
            I.satuan,
            I.in_decimal,
            S.stock,
            S.price
            $QSql
        FROM
            storeloc_stock AS S,
            item AS I
        WHERE
            S.item = I.id AND 
            S.company = '" . $company . "' AND 
            S.storeloc = '" . $storeloc . "' AND 
            S.stock > 0
        $CLAUSE
        $QSqlClause
        $ORDER
        LIMIT
            100
    ");

    $i = 0;
    while($Data = $DB->Result($Q_Data)){
        $return[$i] = $Data;

        $i++;
    }

}
//=> / END : Select Data

echo Core::ReturnData($return);
?>