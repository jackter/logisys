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
    'def'           => 'company'
);

$CLAUSE = "
    WHERE 
        id != ''
";

$PermCompany = Core::GetState('company');
if($PermCompany != "X"){
    $CLAUSE .= " AND id IN (" . $PermCompany . ")";
}

/**
 * Get Data
 */
$Q_Data = $DB->QueryOn(
    DB['master'],
    $Table['def'],
    array(
        'id',
        'abbr',
        'nama'
    ),
    $CLAUSE .
    "
        ORDER BY
            nama ASC
    "
);
$R_Data = $DB->Row($Q_Data);

if($R_Data > 0){

    $i = 0;
    while($Data = $DB->Result($Q_Data)){

        $return['company'][$i] = $Data;

        $i++;
    }
}
//=> / END : Get Data

echo Core::ReturnData($return);
?>