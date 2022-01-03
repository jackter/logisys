<?php
//=> Default Statement
$return = [];
$RPL	= "";
$SENT   = Core::Extract($_POST, $RPL);

//=> Extract Array
if(isset($SENT)){
    foreach($SENT as $KEY => $VAL){	
        $$KEY = $VAL;
    }
}

$Table = array(
    'def'       => 'sys_group'
);

/**
 * Extract Data
 * 
 * Fungsi utama untuk menampilkan data
 */
$Q_Data = $DB->Query(
    $Table['def'],
    array(
        'id',
        'nama'
    ),
    "
        WHERE status != 0
    "
);
$R_Data = $DB->Row($Q_Data);
if($R_Data > 0){
    while($Data = $DB->Result($Q_Data)){

        $return['data'][] = $Data;

    }
}
//=> / END : Extract Data

echo Core::ReturnData($return);
?>