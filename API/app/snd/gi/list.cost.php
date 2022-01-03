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
    'def'        => 'cost_center'
);

$CLAUSE = "";
if($keyword != '' && isset($keyword)){
    $CLAUSE .= " 
        AND nama LIKE '%" . $keyword . "%'
    ";
}

if($company != '' && isset($company)){
    $CLAUSE .= "
        AND company = '" . $company . "'
    ";
}

$Q_Cost = $DB->Query(
    $Table['def'],
    array(
        'id',
        'company',
        'company_abbr',
        'company_nama',
        'kode',
        'nama'  
    ),
    "
        WHERE
            status = 1
            $CLAUSE
        LIMIT
            20
    "
);
$R_Cost = $DB->Row($Q_Cost);
if($R_Cost > 0){
    $i = 0;
    while($Cost = $DB->Result($Q_Cost)){

        $return[$i] = $Cost;

        $i++;
    }

}

echo Core::ReturnData($return);
?>