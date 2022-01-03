<?php

$Modid = 133;
Perm::Check($Modid, 'view');

# Default Statement
$return = [];
$RPL    = "";
$SENT    = Core::Extract($_POST, $RPL);

# Extract Array
if (isset($SENT)) {
    foreach ($SENT as $KEY => $VAL) {
        $$KEY = $VAL;
    }
}

$Table = array(
    'def'       => 'cost_center'
);

#Get Data
$Q_Data = $DB->Query(
    $Table['def'],
    array(
        'id',
        'company',
        'company_nama',
        'kode',
        'nama',
        'keterangan',
    ),
    "
        WHERE id = '" . $id . "'
    "
);
$R_Data = $DB->Row($Q_Data);
if ($R_Data > 0) {
    $Data = $DB->Result($Q_Data);

    $return['data'] = $Data;
}

echo Core::ReturnData($return);

?>