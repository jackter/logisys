<?php
$Modid = 108;

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
    'def'       => 'produksi_param'
);

/**
 * Get Data
 */
$Q_Data = $DB->Query(
    $Table['def'],
    array(
        'id',
        'company',
        'company_abbr',
        'company_nama',
        'year',
        'month',
        'labour',
        'maintenance',
        'factory',
        'general',
        'laboratory',
        'engineering',
        'effulent',
        'depreciation',
        'verified',
        'approved'
    ),
    "
        WHERE id = '" . $id . "'
    "
);
$R_Data = $DB->Row($Q_Data);
if($R_Data > 0){
    $Data = $DB->Result($Q_Data);

    $return['data'] = $Data;

    $return['data']['bulan'] = din_bulanEn_full($Data['month']);

}
//=> / END : Get Data

echo Core::ReturnData($return);
?>