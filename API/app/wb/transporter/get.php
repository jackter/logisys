<?php
$Modid = 78;
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
    'def'       => 'wb_transporter'
);

/**
 * Get Data
 */
$Q_Data = $DB->Query(
    $Table['def'],
    array(
        'id',
        'nama'
    ),
    "
        WHERE
            id = '" . $id . "'
    "
);
$R_Data = $DB->Row($Q_Data);

if($R_Data > 0){
    $Data = $DB->Result($Q_Data);
    $return['data'] = $Data;
}
//=> / END : Get Data

echo Core::ReturnData($return);
?>