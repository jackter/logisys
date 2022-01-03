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
    'def'           => 'ast'
);

$CLAUSE = "";
if($keyword != '' && isset($keyword)){
    $CLAUSE .= " 
        AND kode LIKE '%" . $keyword . "%'
    ";
}

if($company != '' && isset($company)){
    $CLAUSE .= "
        AND company = '" . $company . "'
    ";
}

/**
 * Get Data
 */
$Q_Data = $DB->Query(
    $Table['def'],
    array(
        'id',
        'kode'
    ),
    "
        WHERE
            asset_usage = 1
            AND cip_post_asset = 0
            AND verified = 1
            $CLAUSE
        GROUP BY
            id
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