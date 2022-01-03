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
    'm_item'       => 'purchaseitem'
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
//=> / END : Filter

/**
 * Filter Table
 */
$ftable = json_decode($ftable, true);
$FQSql = $FQSqlClause = $FQSqlOrder = [];
if(isset($ftable)){
    $i = 0;
    foreach($ftable AS $Key => $Val){

        /**
         * Generate Clause
         */
        switch($Key){

            default:
                /*$CLAUSE .= "
                    AND 
                        $Key LIKE '%" . $Val['filter'] . "%'                    
                ";*/

                $Search = Search::CreateDyn(
                    $Val['filter'],
                    array($Key),
                    array(1),
                    $Key
                );

                $FQSql[$i] = "," . $Search['query'];
                $FQSqlClause[$i] = $Search['having'];
                $FQSqlOrder[$i] = $Search['order'];

                $i++;
        }
        //=> / END : Generate Clause

        //$return['ftable'] = $Val;
        //$return['clause'] = $CLAUSE;
    }
}
//=> / END : Filter Table

/**
 * Listing Data
 */
$return['start']        = 0;
$return['limit']        = $limit;
$return['count']        = 0;

/**
 * Extract Search
 */
$AllQSql = $AllQSqlClause = $AND = $COMMA = $HAVING = "";
$ORDER = "
    ORDER BY
        kode ASC
";
if(sizeof($FQSql) > 0){
    $AllQSqlClause = " HAVING ";
    $ORDER = " ORDER BY ";
    for($i = 0; $i < sizeof($FQSql); $i++){
        $AllQSql .= $FQSql[$i];
        $AllQSqlClause .= $AND . $FQSqlClause[$i];
        $ORDER .= $COMMA . $FQSqlOrder[$i];
        $AND  = " AND ";
        $COMMA = ",";
    }
}
//=> / END : Extract Search

$Q_Data = $DB->Query(
    $Table['def'],
    array('id' . $AllQSql),
    $CLAUSE . 
    $AllQSqlClause
);
$R_Data = $DB->Row($Q_Data);

if($R_Data > 0){

    $return['start']        = $start;
    $return['limit']        = $limit;
    $return['count']        = $R_Data;

    $Q_Data = $DB->Query(
        $Table['def'],
        array(
            'id',
            'kode',
            'nama',
            'satuan' . $AllQSql
        ),
        $CLAUSE . 
        $AllQSqlClause .
        $ORDER . 
        "
            LIMIT 
                $offset, $limit
        "
    );

    $i = 0;
    while($Data = $DB->Result($Q_Data)){

        $return['data'][$i] = $Data;

        $i++;
    }

}else{

}
//=> / END : Listing Data

echo Core::ReturnData($return);
?>