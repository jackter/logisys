<?php
$Modid = 199;

Perm::Check($Modid, 'view');

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
    'def'           => 'wo',
    'mr'            => 'mr',
    'mr_detail'     => 'mr_detail',
    'wo_mechanic'   => 'wo_mechanic',
    'wo_overtime'   => 'wo_overtime',
    'wo_material'   => 'wo_material',
    'wo_pro'        => 'wo_proses',
    'wo_pro_det'    => 'wo_proses_detail',

);

/**
 * Filter
 */
$CLAUSE = "
    WHERE 
        id != '' AND
        approved = 1
";
//=> / END : Filter

$CLAUSE .= "
    AND order_date BETWEEN '" . $fdari . " 00:00:00' AND '" . $fhingga . " 23:59:59'
    AND company = '" . $company . "'
";

$Q_Data = $DB->Query(
    $Table['def'],
    array(

    ),
    $CLAUSE
);
$R_Data = $DB->Row($Q_Data);

if($R_Data > 0){

    $i = 0;
    while($Data = $DB->Result($Q_Data)){

        $return['data'][$i] = $Data;

        $i++;
    }
}

echo Core::ReturnData($return);
?>