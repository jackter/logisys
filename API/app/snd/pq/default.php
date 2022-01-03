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
    'tax'       => 'taxmaster',
);

/**
 * Tax Master - PPh
 */
$Q_PPh = $DB->Query(
    $Table['tax'],
    array(),
    "
        WHERE
            status = 1 AND 
            tipe = 1
    "
);
$R_PPh = $DB->Row($Q_PPh);
if($R_PPh > 0){
    while($PPh = $DB->Result($Q_PPh)){
        $return['pph'][] = $PPh;
    }
}
//=> / END : Tax Master - PPh

/**
 * Extract Cur
 */
$Q_Cur = $DB->Query(
    'cur',
    array(
        'id',
        'kode',
        'nama',
        'country'
    ),
    "
        WHERE
            status != 0
        ORDER BY
            id ASC
    "
);
$R_Cur = $DB->Row($Q_Cur);

if($R_Cur > 0){

    $i = 0;
    while($Cur = $DB->Result($Q_Cur)){
        $return['currency'][$i] = $Cur;
        $i++;
    }
}
//=> / END : Extract Cur

/**
 * List Store Loc
 */
$Q_Storeloc = $DB->Query(
    'storeloc',
    array(
        'id',
        'company',
        'kode',
        'nama'
    ),
    "
        WHERE
            status = 1
            AND kategori = 1
    "
);
$R_Storeloc = $DB->Row($Q_Storeloc);
if ($R_Storeloc > 0) {
    while ($Storeloc = $DB->Result($Q_Storeloc)) {
        $return['list_storeloc'][] = $Storeloc;
    }
}
//=> / END : List Store Loc

echo Core::ReturnData($return);
?>