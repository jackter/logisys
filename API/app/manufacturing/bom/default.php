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
    'def'       => 'storeloc'
);

/**
 * Storeloc Store
 */
$Q_Storeloc = $DB->Query(
    $Table['def'],
    array(
        'id',
        'kode',
        'nama'
    ),
    "
        WHERE
            company = '3' AND
            status != 0
    "
);
$R_Storeloc = $DB->Row($Q_Storeloc);
if($R_Storeloc > 0){
    while($Storeloc = $DB->Result($Q_Storeloc)){
        $return['storeloc'][] = $Storeloc;
    }
}
//=> / END : Storeloc Store

$Params = Core::GetParams(array(
    'alokasi_coa'
));
$return['params'] = $Params;

echo Core::ReturnData($return);
?>