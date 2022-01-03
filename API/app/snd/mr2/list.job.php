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
    'def'           => 'job_alocation'
);

$CLAUSE = "
    WHERE
        id != '' AND
        status = 1
";

if($company != '' && isset($company)){
    $CLAUSE .= "
        AND company = '" . $company . "'
    ";
}

if($keyword != '' && isset($keyword)){
    $CLAUSE .= "
        AND nama LIKE '%" . $keyword . "%'
    ";
}

$Q_Data = $DB->Query(
    $Table['def'],
    array(
        'id',
        'coa',
        'coa_kode',
        'coa_nama',
        'nama'
    ),
    $CLAUSE .
    "
        LIMIT 100
    "
);
$R_Data = $DB->Row($Q_Data);

if($R_Data > 0) {

    $i = 0;
    while($Data = $DB->Result($Q_Data)) {

        $return['job_alocation'][$i] = $Data;
        $i++;
    }
}

echo Core::ReturnData($return);
?>