<?php

/*Default Statement*/
$return = [];
$RPL    = "";
$SENT    = Core::Extract($_POST, $RPL);

/*Extract Array*/
if (isset($SENT)) {
    foreach ($SENT as $KEY => $VAL) {
        $$KEY = $VAL;
    }
}

$Table = array(
    'def' => 'taxmaster'
);

/** Get Data */
$Q_Data = $DB->Query(
    $Table['def'],
    array(
        'id',
        'company',
        'company_abbr',
        'company_nama',
        'code',
        'description',
        'rate',
        'tipe',
        'pembukuan',
        'coa',
        'coa_kode',
        'coa_nama'
    ),
    "
        WHERE id = '" . $id . "'
    "
);
$R_Data = $DB->Row($Q_Data);
if ($R_Data > 0) {
    $Data = $DB->Result($Q_Data);
    $return['status'] = 1;
    $return['data'] = $Data;
}

echo Core::ReturnData($return);

?>
