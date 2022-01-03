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
    'def'       => 'invoice'
);

$CLAUSE = "
    AND inv_tgl = '".$tanggal."'
";
if($keyword != '' && isset($keyword)){
    $CLAUSE .= " 
        AND kode LIKE '%" . $keyword . "%'
    ";
}
if($company != '' && isset($company)){
    $CLAUSE .= "
        AND company = '" . $company . "'
    ";
}
if($supplier != '' && isset($supplier)){
    $CLAUSE .= "
        AND supplier = '" . $supplier . "'
    ";
}

$Q_Supplier = $DB->Query(
    $Table['def'],
    array(

    ),
    "
        WHERE
            verified = 1
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

echo Core::ReturnData($return);
?>