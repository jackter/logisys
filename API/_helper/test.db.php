<?php
$Q_Data = $DB->QueryOn(
    DB['master'],
    'item_global',
    array(
        'kode',
        'nama',
        'unit'
    ),
    "
        LIMIT 1000
    "
);
$R_Data = $DB->Row($Q_Data);

echo "DB ROW" . $R_Data;
?>