<?php
// $Modid = 61;

// Perm::Check($Modid, 'view');

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
    'def'       => 'oip_tpl'
);

/**
 * Get Data
 */
$Q_Data2 = $DB->Query(
    $Table['def'],
    array(
        'item',
        'item_nama'
    ),
    "
        WHERE
            plant = '" . $plant . "'
        GROUP BY
            item
        ORDER BY
            item_nama ASC
    "
);
$R_Data2 = $DB->Row($Q_Data2);
$arrItem = array();
if($R_Data2 > 0){
    $i = 0;
    while($Data = $DB->Result($Q_Data2)){

        $arrItem[$i] = $Data;
        $i++;
    }
}

$Q_Data = $DB->Query(
    $Table['def'],
    array(
        'id',
        'plant',
        'item',
        'item_nama',
        'vessel',
        'volume', 
        'density',
        'mt'
    ),
    "
        WHERE
            plant = '" . $plant . "'
    "
);
$R_Data = $DB->Row($Q_Data);
$arrData = array();
if($R_Data > 0){

    $return['data'] = $arrItem;
    $i = 0;
    while($Data = $DB->Result($Q_Data)){
        for($x = 0; $x < count($arrItem); $x++){
            if($Data['item'] == $arrItem[$x]['item']){
                if(empty($return['data'][$x]['detail'])){
                    $return['data'][$x]['detail'][0] = $Data;    
                }
                else{
                    $check = count($return['data'][$x]['detail']);
                    $return['data'][$x]['detail'][$check] = $Data;
                }
            }           
        } 
        $i++;
    }

}
//=> END : Get Data

echo Core::ReturnData($return);
?>