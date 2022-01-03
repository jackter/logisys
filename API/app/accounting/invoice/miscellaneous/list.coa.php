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
    'def'           => 'coa_master'
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

$Q_Data = $DB->Query(
    $Table['def'],
    array(
        'id',
        'kode',
        'nama'
    ),
    "
        WHERE
            status = 1
            AND is_h = 0
            $CLAUSE
        ORDER BY
            kode ASC
        LIMIT
            50
    "
);
$R_Data = $DB->Row($Q_Data);

if($R_Data > 0) {
    $i = 0;
    while($Data = $DB->Result($Q_Data)) {

        $return['coa'][$i] = $Data;
        $i++;
    }
}

echo Core::ReturnData($return);
?>