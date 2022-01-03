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
    'def'           => 'invoice',
    'item'          => 'item',
    'po'            => 'po',
    'po_detail'     => 'po_detail'
);

$CLAUSE = "";

if($keyword != '' && isset($keyword)){
    $CLAUSE .= " 
        AND D.kode LIKE '%" . $keyword . "%'
    ";
}

if($company != '' && isset($company)){
    $CLAUSE .= "
        AND D.company = '" . $company . "'
    ";
}
if($supplier != '' && isset($supplier)){
    $CLAUSE .= "
        AND D.supplier = '" . $supplier . "'
    ";
}
if($po != '' && isset($po)){
    $CLAUSE .= "
        AND D.po = '" . $po . "'
    ";
}

if($tipe != '' && isset($tipe)){
    $CLAUSE .= "
        AND D.tipe = '" . $tipe . "'
    ";
}

/**
 * Get Data
 */
$Q_PO = $DB->QueryPort("
    SELECT
        D.id,
        D.kode,
        D.ref_kode,
        D.tipe,
        D.amount,
        D.grn_id
    FROM
        " . $Table['def'] . " AS D,
        " . $Table['po'] . " AS P
    WHERE D.po = P.id
        AND D.verified = 1
        AND D.sp3 = 0
        $CLAUSE
    GROUP BY
        D.id
    ORDER BY
        D.create_date desc
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