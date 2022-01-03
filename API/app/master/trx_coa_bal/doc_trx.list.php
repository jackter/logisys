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
    'def'           => 'trx_type'
);

$CLAUSE = "";
if($keyword != '' && isset($keyword)){
    $CLAUSE .= " 
        WHERE ( doc_source LIKE '%" . $keyword . "%' OR
            doc_nama LIKE '%" . $keyword . "%' )
    ";
}

/**
 * Get Data
 */
$Q_Data = $DB->Query(
    $Table['def'],
    array(
        'id',
        'doc_source',
        'doc_nama'
    ),
    "
        $CLAUSE
        ORDER BY
            doc_source, doc_nama ASC
        LIMIT
            100
    "
);
$R_Data = $DB->Row($Q_Data);
if($R_Data > 0){

    $i = 0;
    while($Data = $DB->Result($Q_Data)){

        $return[$i] = $Data;

        $i++;
    }
}
//=> / END : Get Data

echo Core::ReturnData($return);
?>