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
        AND 
            ( kode LIKE '%" . $keyword . "%' OR
            nama LIKE '%" . $keyword . "%' )
    ";
}

$CLAUSE .= "
    AND company = '" . $company . "'
";

/**
 * Get Data
 */
$Q_Data = $DB->Query(
    $Table['def'],
    array(
        'id',
        'kode',
        'nama',
        'lv1',
        'lv2',
        'lv3',
        'lv4',
        'lv5',
    ),
    "
        WHERE
            status = 1
            $CLAUSE
        ORDER BY
            kode, nama ASC
        LIMIT
            100
    "
);
$R_Data = $DB->Row($Q_Data);
if($R_Data > 0){

    $i = 0;
    while($Data = $DB->Result($Q_Data)){

        $return[$i] = $Data;

        $i++;
    }
}
//=> / END : Get Data

echo Core::ReturnData($return);
?>