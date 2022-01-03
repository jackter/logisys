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
    'def'      => 'activity_location_control'
);

$CLAUSE = "";
if($keyword != '' && isset($keyword)){
    $CLAUSE .= " 
        AND (coa_nama LIKE '%" . $keyword . "%' OR
        coa_kode LIKE '" . $keyword . "%')
    ";
}

if($company != '' && isset($company)){
    $CLAUSE .= "
        AND company = '" . $company . "'
    ";
}

if($alokasi) {
    $CLAUSE .= "
        AND coa_alokasi = '" . $alokasi . "'
    ";
}

/**
 * Extract COA
 */
$Q_COA = $DB->Query(
    $Table['def'],
    array(
        'coa'           => 'id',
        'coa_kode'      => 'kode',
        'coa_nama'      => 'nama'
    ),
    "
        WHERE
            status != 0 AND
            doc_source = 'Supply & Demand' AND
            doc_nama = 'Reservation'
            $CLAUSE
        ORDER BY
            coa_kode ASC
        LIMIT
            100
    "
);
$R_COA = $DB->Row($Q_COA);
if($R_COA > 0){
    while($COA = $DB->Result($Q_COA)){
        $return[] = $COA;
    }
}
//=> / END : Extract COA

echo Core::ReturnData($return);
?>