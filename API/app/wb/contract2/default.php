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

include "app/_global/company.php";

$Table = array(
    'produk'       => 'wb_produk'
);

/**
 * Produk
 */
$Q_Produk = $DB->Query(
    $Table['produk'],
    array(
        'id'    => 'produk',
        'kode'  => 'produk_kode',
        'nama'  => 'produk_nama',
        'item',
        'item_kode',
        'item_nama',
        'item_satuan'
    )
);
$R_Produk = $DB->Row($Q_Produk);
if($R_Produk > 0){
    $i = 0;
    while($Produk = $DB->Result($Q_Produk)){

        $return['produk'][$i] = $Produk;

        $i++;
    }
}
//=> End Produk

echo Core::ReturnData($return);
?>