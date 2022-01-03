<?php

$return = [];
$RPL    = "";
$SENT   = Core::Extract($_POST, $RPL);

if (isset($SENT)) {
    foreach ($SENT as $KEY => $VAL) {
        $$KEY = $VAL;
    }
}

#Menampilkan Data
$Q_Data = $DB->QueryOn(
    DB['master'],
    "company",
    array(
        'id',
        'nama',
        'abbr'
    ),
    "
        ORDER BY nama ASC
    "
);

$i = 0;
while ($Data = $DB->Result($Q_Data)) {
    $return['data'][$i] = $Data;

    $i++;
}

$Q_Bank = $DB->Query(
    "bank",
    array(
        'id',
        'kode',
        'nama',
        'currency'
    ),
    "
        ORDER BY nama ASC
    "
);

$R_Bank = $DB->Row($Q_Bank);
if($R_Bank > 0){
    while ($Bank = $DB->Result($Q_Bank)) {
        $return['bank'][] = $Bank;
    }
}

/**
 * Extract COA
 */
$Q_COA = $DB->Query(
    "coa_master",
    array(
        'id',
        'company',
        'kode',
        'nama'
    ),
    "
        WHERE
            status != 0 AND
            is_h = 0
        ORDER BY
            kode ASC
    "
);
$R_COA = $DB->Row($Q_COA);
if($R_COA > 0){
    while($COA = $DB->Result($Q_COA)){
        $return['coa'][] = $COA;
    }
}
//=> / END : Extract COA

echo Core::ReturnData($return);

?>
