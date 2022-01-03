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
    'def'       => 'invoice',
    'detail'    => 'invoice_expense'
);

$CLAUSE = "";

if($keyword != '' && isset($keyword)){
    $CLAUSE .= " 
        AND H.kode LIKE '%" . $keyword . "%'
    ";
}

if($company != '' && isset($company)){
    $CLAUSE .= "
        AND H.company = '" . $company . "'
    ";
}
if($supplier != '' && isset($supplier)){
    $CLAUSE .= "
        AND H.pihak_ketiga = '" . $supplier . "'
    ";
}
if($tipe_pihak_ketiga != '' && isset($tipe_pihak_ketiga)){
    $CLAUSE .= "
        AND H.tipe_pihak_ketiga = '" . $tipe_pihak_ketiga . "'
    ";
}

/**
 * Get Data
 */
$Q_PO = $DB->QueryPort("
    SELECT
        H.id,
        H.kode,
        H.ref_kode,
        H.tipe,
        H.amount
    FROM
        " . $Table['def'] . " AS H
    WHERE H.verified = 1
        AND H.tipe = 4
        AND H.sp3 = 0
        $CLAUSE
    ORDER BY
        H.create_date desc
");
$R_PO = $DB->Row($Q_PO);
if($R_PO > 0){

    $i = 0;
    while($PO = $DB->Result($Q_PO)){

        $return[$i] = $PO;

        $i++;
    }
}
//=> / END : Get Data

echo Core::ReturnData($return);
?>