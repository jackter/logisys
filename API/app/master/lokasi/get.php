<?php

$Modid = 202;
Perm::Check($Modid, 'view');

//=> Default Statement
$return = [];
$RPL    = "";
$SENT   = Core::Extract($_POST, $RPL);

//=> Extract Array
if (isset($SENT)) {
    foreach ($SENT as $KEY => $VAL) {
        $$KEY = $VAL;
    }
}

$Table = array(
    'def'       => 'wo_location'
);

/**
 * Get Data
 */
$Q_Data = $DB->Query(
    $Table['def'],
    array(
        'id',
        'nama',
        'company',
        'company_abbr',
        'company_nama',
        'remarks'
    ),
    "
        WHERE 
            id = '" . $id . "'
    "
);
$R_Data = $DB->Row($Q_Data);
if ($R_Data > 0) {
    $Data = $DB->Result($Q_Data);

    $return['data'] = $Data;
}
//=> / END : Get Data

echo Core::ReturnData($return);

?>