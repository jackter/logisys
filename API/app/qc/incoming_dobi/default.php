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

$Modid = 125;

$Table = array(
    'wbtrx'     => 'wb_transaksi'
);

$return['permissions'] = Perm::Extract($Modid);

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