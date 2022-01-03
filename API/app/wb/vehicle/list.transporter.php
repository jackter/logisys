<?php

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
    'def'       => 'wb_transporter'
);

$CLAUSE = "";
if($keyword != '' && isset($keyword)){
    $CLAUSE .= " 
        AND nama LIKE '%" . $keyword . "%'
    ";
}

$Q_Data = $DB->Query(
    $Table['def'],
    array(
        'id',
        'nama'
    ),
    "
        WHERE
            id != ''
            $CLAUSE
    "

);
$R_Data = $DB->Row($Q_Data);

if($R_Data > 0){

    while($Data = $DB->Result($Q_Data)){
        $return['data'][] = $Data;
    }
}

echo Core::ReturnData($return);
?>