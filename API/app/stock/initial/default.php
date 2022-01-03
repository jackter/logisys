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
    'def'       => 'storeloc',
    'kategori'  => 'storeloc_kategori'
);

//=> Company
include "app/_global/company.instore.php";

/**
 * Kategori Store
 */
$Q_Kategori = $DB->Query(
    $Table['kategori'],
    array(
        'id',
        'kode',
        'nama'
    ),
    "
        WHERE
            status != 0
    "
);
$R_Kategori = $DB->Row($Q_Kategori);
if($R_Kategori > 0){
    while($Kategori = $DB->Result($Q_Kategori)){
        $return['kategori'][] = $Kategori;
    }
}
//=> / END : Kategori Store

echo Core::ReturnData($return);
?>