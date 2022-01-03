<?php
$Modid = 188;

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
    'def'       => 'wb_kontrak_dev',
    'trx'       => 'wb_transaksi',
    'po'        => 'po'
);

/**
 * Get Data
 */
$Q_Data = $DB->Query(
    $Table['def'],
    array(
        'id',
        'kode',
        'sup_cust'      => 'supplier',
        'sup_cust_nama' => 'supplier_nama',
        'product',
        'product_kode',
        'product_nama',
        'item',
        'item_kode',
        'item_nama',
        'item_satuan',
        'po',
        'tanggal',
        'qty',
        'approved',
        'approved_by',
        'approved_date'
    ),
    "
        WHERE id = '" . $id . "'
    "
);

$R_Data = $DB->Row($Q_Data);
if($R_Data > 0){

    $Data = $DB->Result($Q_Data);

    $return['data'] = $Data;

    /**
     * Get Transaksi
     */
    $TRX = $DB->Query(
        $Table['trx'],
        array('id'),
        "
            WHERE
                contract = '".$id."'
        "
    );
    $R_TRX = $DB->Row($TRX);
    if($R_TRX > 0){
        $return['data']['available_trx'] = 1;
    }else{
        $return['data']['available_trx'] = 0;
    }
    //=> End Get Transaksi

    # Get list po
    $Q_PO = $DB->Query(
        $Table['po'],
        array(
            'id',
            'kode'
        ),
        " 
            WHERE 
                id IN (" . $Data['po'] . ")
        "
    );
    $R_PO = $DB->Row($Q_PO);
    if($R_PO > 0) {
        while ($PO = $DB->Result($Q_PO)){
            $return['data']['list_po'][] = $PO;
        }
    }

}

echo Core::ReturnData($return);
?>
