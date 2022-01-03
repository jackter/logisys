<?php
$Modid = 112;

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
    'def'       => 'oip',
    'detail'    => 'oip_detail',
    'tpl'       => 'oip_tpl'
);

/**
 * Get Plant
 */
$Plant = $DB->Result($DB->Query(
    $Table['def'],
    array(
        'plant'
    ),
    "
        WHERE
            id = '" . $id . "'
    "
));
//=> END : Get Plant

/**
 * Get Item
 */
$Q_Item = $DB->Query(
    $Table['tpl'],
    array(
        'item',
        'item_nama'
    ),
    "
        WHERE
            plant = '" . $Plant['plant'] . "'
        GROUP BY
            item
        ORDER BY
            item_nama ASC
    "
);
$R_Item = $DB->Row($Q_Item);
$arrItem = array();
if($R_Item > 0){
    $i = 0;
    while($Item = $DB->Result($Q_Item)){
        $arrItem[$i] = $Item;
        $i++;
    }
}
//=> END : Get Item

/**
 * Get Detail
 */
$Q_Data = $DB->QueryPort(
    "
        SELECT
            T.id,
            T.plant,
            T.item,
            T.item_nama,
            T.vessel,
            T.volume,
            T.density,
            T.mt,
            D.level,
            D.actual_oip 
        FROM
            oip_tpl T
            LEFT JOIN (oip_detail D JOIN oip H ON H.id = D.header AND H.id = '" . $id . "') ON D.id_tpl = T.id
        WHERE
            T.plant = '" . $Plant['plant'] . "'
    "
);
$R_Data = $DB->Row($Q_Data);
if($R_Data > 0){

    /**
     * Calculate 
     */
    $Q_Calculate = $DB->QueryPort("
        SELECT
            SUM(actual_oip) as total
        FROM
            oip_detail
        WHERE
            header = '" . $id . "'
        GROUP BY
            item
        ORDER BY
            item_nama ASC
    ");

    $i = 0;
    while($Calculate = $DB->Result($Q_Calculate)){
        $return['total'][$i] = $Calculate['total'];

        $i++;
    }
    //=> END : Calculate

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
//=> END : Get Detail

/**
 * Get Data Header
 */
$Q_Header = $DB->Query(
    $Table['def'],
    array(
        'id',
        'kode',
        'tanggal',
        'plant',
        'verified'
    ),
    "
        WHERE
            id = '" . $id . "'
    "
);
$R_Header = $DB->Row($Q_Header);

if($R_Header > 0){

    $Header = $DB->Result($Q_Header);

    $return['header'] = $Header;
}
//=> END : Get Data Header

echo Core::ReturnData($return);
?>