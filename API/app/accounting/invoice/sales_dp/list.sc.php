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
        AND kode LIKE '%" . $keyword . "%'
    ";
}

if($company != '' && isset($company)){
    $CLAUSE .= "
        AND company = '" . $company . "'
    ";
}
if($cust != '' && isset($cust)){
    $CLAUSE .= "
        AND cust = '" . $cust . "'
    ";
}

if($tipe == 1){
    $CLAUSE .= " 
        AND dp > 0
        AND dp_invoice_status = 0
    ";
}

/**
 * Get Data
 */
$Q_SC = $DB->Query(
    $Table['def'],
    array(
        'id',
        'company',
        'company_abbr',
        'company_nama',
        'kode',
        'cust',
        'cust_kode',
        'cust_nama',
        'cust_abbr',
        'dp',
        'ppn',
        'currency',
        'inclusive_ppn',
        'sold_price',
        'grand_total',
        'qty',
        'item',
        'item_kode',
        'item_nama',
        'item_satuan'
    ),
    "
        WHERE
            approved = 1
            $CLAUSE
        GROUP BY
            id
    "
);
$R_SC = $DB->Row($Q_SC);
if($R_SC > 0){

    $i = 0;
    while($SC = $DB->Result($Q_SC)){

        $return[$i] = $SC;
        $i++;
        
    }
}
//=> / END : Get Data

echo Core::ReturnData($return);
?>