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
    'def'       => 'wb_transaksi'
);

$Q_Data = $DB->Query(
    $Table['def'],
    array(
        'pks',
        'sup_cust',
        'sup_cust_nama'
    ),
    "
        WHERE
            pks != ''
        GROUP BY
            pks
        ORDER BY
            pks ASC
    "
);
$i = 0;
while($Data = $DB->Result($Q_Data)){

    $return['data'][$i] = $Data;

    $i++;
}


echo Core::ReturnData($return);

?>