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
    'def'   =>  'storeloc' 
);

/**
 * Get Data
 */
$Q_Data = $DB->Query(
    $Table['def'],
    array(
        'id',
        'kode',
        'nama',
        'produk'
    ),
    "
        WHERE
            company = '" . $company . "' AND
            sounding = 1
        ORDER BY
            nama
    "
);
$R_Data = $DB->Row($Q_Data);

if($R_Data > 0) {

    while($Data = $DB->Result($Q_Data)) {
        $return['storeloc'][] = $Data;
    }
}
//=> END : Get Data

echo Core::ReturnData($return);
?>