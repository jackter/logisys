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
    'def'           => 'kontrak'
);

$CLAUSE = "";
if($keyword != '' && isset($keyword)){
    $CLAUSE .= " 
        AND (cust_nama LIKE '%" . $keyword . "%' OR cust_abbr LIKE '%" . $keyword . "%')
    ";
}

$CLAUSE .= "
    AND dp > 0 
    AND dp_invoice_status = 0
    AND company = '" . $company . "'
";

/**
 * Get Data
 */
$Q_Customer = $DB->Query(
    $Table['def'],
    array(
        'cust',
        'cust_kode',
        'cust_nama',
        'cust_abbr',
    ),
    "
        WHERE
            approved = 1
            $CLAUSE
        GROUP BY
            cust
        ORDER BY
            cust_nama ASC
    "
);
$R_Customer = $DB->Row($Q_Customer);
if($R_Customer > 0){

    $i = 0;
    while($Customer = $DB->Result($Q_Customer)){

        $return[$i] = $Customer;

        $i++;
    }
}
//=> / END : Get Data

echo Core::ReturnData($return);
?>