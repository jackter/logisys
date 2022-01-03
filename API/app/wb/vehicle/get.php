<?php
$Modid = 79;

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
    'def'       => 'wb_vehicle'
);

/**
 * Get Data
 */
$Q_Data = $DB->QueryPort("
    SELECT
        V.id,
        V.nopol,
        V.transporter,
        T.nama as transporter_nama
    FROM
        wb_transporter T,
        wb_vehicle V
    WHERE
        V.transporter = T.id AND
        V.id = '" . $id . "'
");
$R_Data = $DB->Row($Q_Data);
if($R_Data > 0){
    $Data = $DB->Result($Q_Data);

    $return['data'] = $Data;
}
//=> / END : Get Data

echo Core::ReturnData($return);
?>