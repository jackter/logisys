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
        ORDER BY 
            nama ASC
    "
);

$i = 0;
while ($Data = $DB->Result($Q_Data)) {

    $return['data'][$i] = $Data;

    $i++;
}

echo Core::ReturnData($return);

?>
