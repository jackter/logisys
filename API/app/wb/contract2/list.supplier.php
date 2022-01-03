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
    'def'           => 'supplier'
);

$CLAUSE = "";
if($keyword != '' && isset($keyword)){
    $CLAUSE .= " 
        AND nama LIKE '%" . $keyword . "%'
    ";
}

/**
 * Get Data
 */
$Q_Supplier = $DB->Query(
    $Table['def'],
    array(
        'id',
        'kode',
        'nama'
    ),
    "
        WHERE
            status = 1
            $CLAUSE
        LIMIT
            50
    "
);
$R_Supplier = $DB->Row($Q_Supplier);
if($R_Supplier > 0){

    $i = 0;
    while($Supplier = $DB->Result($Q_Supplier)){

        $return[$i] = $Supplier;

        $i++;
    }
}
//=> / END : Get Data

echo Core::ReturnData($return);
?>