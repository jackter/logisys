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
    'def'           => 'gr'
);

$CLAUSE = "";
if($keyword != '' && isset($keyword)){
    $CLAUSE .= " 
        AND supplier_nama LIKE '%" . $keyword . "%'
    ";
}

$CLAUSE .= "
    AND company = '" . $company . "'
";

/**
 * Get Data
 */
$Q_Supplier = $DB->Query(
    $Table['def'],
    array(
        'supplier',
        'supplier_kode',
        'supplier_nama'
    ),
    "
        WHERE
            status = 1
            AND inv = 0
            $CLAUSE
        GROUP BY
            supplier
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