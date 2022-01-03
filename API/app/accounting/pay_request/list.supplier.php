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
    'def'           => 'invoice'
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
$Q_Supplier = $DB->QueryPort("
    SELECT
        x.supplier,
        x.supplier_kode,
        x.supplier_nama,
        y.jenis 
    FROM
        invoice x,
        supplier y 
    WHERE
        x.supplier = y.id 
        AND verified = 1 
        AND sp3 = 0
        $CLAUSE 
    GROUP BY
        x.supplier 
    ORDER BY
        x.supplier_nama ASC               
");
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