<?php
$Modid = 198;

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

//=> Company
include "app/_global/company.php";

$return['permissions'] = Perm::Extract($Modid);

$Table = array(
    'ctm'   => 'customer'
);

/**
 * Customer
 */
$Q_CTMR = $DB->Query(
    $Table['ctm'],
    array(
        'id',
        'kode',
        'abbr',
        'nama',
        'jenis',
        'alamat',
        'kabkota',
        'provinsi'
    )
);
$R_CTMR = $DB->Row($Q_CTMR);
if($R_CTMR > 0){
    $i = 0;
    while($CTMR = $DB->Result($Q_CTMR)){

        $return['customer'][$i] = $CTMR;
        $return['customer'][$i]['nama_full'] = $CTMR['jenis'] . '. ' . $CTMR['nama'];

        $i++;
    }
}
//End => Customer

echo Core::ReturnData($return);
?>