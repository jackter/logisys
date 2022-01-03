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
    'sup'           => 'supplier',
    'po'            => 'po',
    'pr'            => 'pr',
    'mr'            => 'mr'
);

$CLAUSE = "";
if($keyword != '' && isset($keyword)){
    $CLAUSE .= " 
        AND P.kode LIKE '%" . $keyword . "%'
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

/**
 * Get Data
 */
$Q_PO = $DB->QueryPort("
    SELECT
        D.po,
        D.company,
        D.company_abbr,
        D.company_nama,
        D.dept,
        D.dept_abbr,
        D.dept_nama,
        P.kode,
        P.tanggal AS tanggal_po,
        D.supplier,
        D.supplier_kode,
        D.supplier_nama,
        S.jenis,
        (SELECT cost_center FROM mr_detail WHERE header = PR.mr LIMIT 1) AS cost_center_id,
        (SELECT cost_center_kode FROM mr_detail WHERE header = PR.mr LIMIT 1) AS cost_center_kode,
        (SELECT cost_center_nama FROM mr_detail WHERE header = PR.mr LIMIT 1) AS cost_center_nama
    FROM
        " . $Table['def'] . " AS D,
        " . $Table['sup'] . " AS S,
        " . $Table['po'] . " AS P,
        " . $Table['pr'] . " AS PR
    WHERE D.po = P.id
        AND D.supplier = S.id
        AND P.pr = PR.id
        AND D.verified = 1
        AND D.sp3 = 0
        $CLAUSE
    GROUP BY
        P.id
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