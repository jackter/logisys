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
    'def'       => 'parameter',
    'wbtrx'     => 'wb_transaksi'
);

/**
 * Parameter
 */
$Q_Parameter = $DB->Query(
    $Table['def'],
    array(
        'param_val'
    ),
    "
        WHERE
            id = 'qc'
    "
);
$R_Parameter = $DB->Row($Q_Parameter);
if($R_Parameter > 0){
    $Parameter = $DB->Result($Q_Parameter);

    $return['parameter'] = json_decode($Parameter['param_val']);
}
//=> End Parameter

/**
 * Source
 */
$Q_Source = $DB->Query(
    $Table['wbtrx'],
    array(
        'pks'
    ),
    "
        WHERE
            pks != ''
        GROUP BY
            pks

    "
);
$R_Source = $DB->Row($Q_Source);
if($R_Source > 0){
    $i = 0;
    while($Source = $DB->Result($Q_Source)){

        $return['source'][$i] = $Source;

        $i++;
    }
}
//=> End Source

echo Core::ReturnData($return);
?>