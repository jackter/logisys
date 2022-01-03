<?php
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
    'def'       => 'kontraktor',
    'company'   => 'company'
);

/**
 * Jenis
 */
$Q_Jenis = $DB->Query(
    $Table['def'],
    array(
        'jenis'
    ),
    "
        WHERE
            (
                jenis != '' OR
                jenis IS NOT NULL
            )
        GROUP BY
            LCASE(jenis)
        ORDER BY
            jenis
    "
);
$R_Jenis = $DB->Row($Q_Jenis);
if ($R_Jenis > 0) {
    while ($Jenis = $DB->Result($Q_Jenis)) {
        $return['jenis'][] = $Jenis['jenis'];
    }
}
//=> / END : Jenis

/**
 * Kabkota
 */
$Q_Kabkota = $DB->Query(
    $Table['def'],
    array(
        'kabkota'
    ),
    "
        WHERE
            (
                kabkota != '' OR
                kabkota IS NOT NULL
            )
        GROUP BY
            LCASE(kabkota)
        ORDER BY
            kabkota
    "
);
$R_Kabkota = $DB->Row($Q_Kabkota);
if ($R_Kabkota > 0) {
    while ($Kabkota = $DB->Result($Q_Kabkota)) {
        $return['kabkota'][] = $Kabkota['kabkota'];
    }
}
//=> / END : Kabkota

/**
 * Provinsi
 */
$Q_Provinsi = $DB->Query(
    $Table['def'],
    array(
        'provinsi'
    ),
    "
        WHERE
            (
                provinsi != '' OR
                provinsi IS NOT NULL
            )
        GROUP BY
            LCASE(provinsi)
        ORDER BY
            provinsi
    "
);
$R_Provinsi = $DB->Row($Q_Provinsi);
if ($R_Provinsi > 0) {
    while ($Provinsi = $DB->Result($Q_Provinsi)) {
        $return['provinsi'][] = $Provinsi['provinsi'];
    }
}
//=> / END : Provinsi

/**
 * Get Company
 */
$CLAUSE = "
    WHERE 
        id != ''
";

$PermCompany = Core::GetState('company');
if($PermCompany != "X"){
    $CLAUSE .= " AND id IN (" . $PermCompany . ")";
}

$Q_Company = $DB->QueryOn(
    DB['master'],
    $Table['company'],
    array(
        'id',
        'abbr',
        'nama'
    ),
    $CLAUSE .
    "
        ORDER BY
            nama ASC
    "
);
$R_Company = $DB->Row($Q_Company);

if($R_Company > 0){

    $i = 0;
    while($Company = $DB->Result($Q_Company)){

        $return['company'][$i] = $Company;

        $i++;
    }
}
//=> / END : Get Company

echo Core::ReturnData($return);

?>