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
    'def'       => 'wb_transaksi',
    'summary'   => 'netto_summary'
);

/**
 * Get Start Tiket
 */
$LastTiket = $DB->Result($DB->Query(
    $Table['summary'],
    array(
        'tiket_end'
    ),
    "
        WHERE
            item = '" .$item. "'
        ORDER BY 
            tiket_end DESC
        LIMIT 1
    "
));

$StartTiket = $DB->Result($DB->Query(
    $Table['def'],
    array(
        'id' => 'tiket',
        'kode' => 'tiket_kode'
    ),
    "
        WHERE
            item = '" .$item. "' AND
            id > '" .$LastTiket['tiket_end']. "'
        LIMIT 1
    "
));
$return['start_tiket']['tiket'] = $StartTiket['tiket'];
$return['start_tiket']['tiket_kode'] = $StartTiket['tiket_kode'];
//=> END Get Start Tiket

/**
 * Get Data
 */
$Q_Data = $DB->Query(
    $Table['def'],
    array(
        'id' => 'tiket',
        'kode' => 'tiket_kode',
        'create_date',
        'netto',
        'item_satuan'
    ),
    "
        WHERE 
            netto != 0 AND
            item = '" .$item. "' AND
            DATE_FORMAT(w_in_date, '%Y-%m-%d') >= '" . $tanggal . "'
    "
);
$R_Data = $DB->Row($Q_Data);
if($R_Data > 0){

    while($Data = $DB->Result($Q_Data)){

        $return['transaksi'][] = $Data;
    }

}
//=> / END : Get Data

echo Core::ReturnData($return);
?>