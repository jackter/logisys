<?php

$Modid = 109;

//=> Default Statement
$return = [];
$RPL    = "";
$SENT    = Core::Extract($_POST, $RPL);

//=> Extract Array
if (isset($SENT)) {
    foreach ($SENT as $KEY => $VAL) {
        $$KEY = $VAL;
    }
}

$Table = array(
    'detail'        => 'sp3_jv_detail',
    'detail_trx'    => 'sp3_detail'
);

/**
 * Detail SP3
 */
$Q_Detail = $DB->Query(
    $Table['detail_trx'],
    array(
        'id'        => 'id_detail',
        'uraian'    => 'memo',
        'jumlah'
    ),
    "
        WHERE
            header = '" . $id . "'
        ORDER BY jumlah DESC
    "
);
$R_Detail = $DB->Row($Q_Detail);

if ($R_Detail > 0) {
    $i = 0;
    while ($Detail = $DB->Result($Q_Detail)) {

        $return['data']['detail'][$i] = $Detail;

        $i++;
    }
}
// => End Detail SP3 JV

/**
 * Detail SP3 JV
 */
$Q_Detail = $DB->Query(
    $Table['detail'],
    array(
        'id'        => 'id_detail',
        'coa'       => 'id',
        'coa_kode'  => 'kode',
        'coa_nama'  => 'nama',
        'debit',
        'credit',
        'keterangan' => 'memo'
    ),
    "
        WHERE
            header = '" . $id . "'
    "
);
$R_Detail = $DB->Row($Q_Detail);

if ($R_Detail > 0) {
    $j = 0;
    while ($Detail = $DB->Result($Q_Detail)) {

        $return['data']['list'][$j] = $Detail;

        $j++;
    }
}
// => End Detail SP3 JV

echo Core::ReturnData($return);

?>