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
    'def'      => 'coa_master'
);

$CLAUSE = "";
if($keyword != '' && isset($keyword)){
    $CLAUSE .= " 
        AND (nama LIKE '%" . $keyword . "%' OR
        kode LIKE '" . $keyword . "%')
    ";
}

if($company != '' && isset($company)){
    $CLAUSE .= "
        AND company = '" . $company . "'
    ";
}

/**
 * Extract COA
 */
$Q_COA = $DB->Query(
    $Table['def'],
    array(
        'id',
        'kode' => 'coa_kode',
        'nama' => 'coa_nama'
    ),
    "
        WHERE
            status != 0
            $CLAUSE
        ORDER BY
            kode ASC
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