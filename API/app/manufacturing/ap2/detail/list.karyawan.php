<?php

$return = [];
$RPL    = "";
$SENT   = Core::Extract($_POST, $RPL);

if (isset($SENT)) {
    foreach ($SENT as $KEY => $VAL) {
        $$KEY = $VAL;
    }
}

/**
 * Filter
 */
$CLAUSE = "
    WHERE 
        id != ''
";

if ($keyword != '' && isset($keyword)) {
    $CLAUSE .= " 
        AND (nama LIKE '%" . $keyword . "%')
    ";
}

if ($company != '' && isset($company)) {
    $CLAUSE .= "
        AND company = '" . $company . "'
    ";
}

if ($dept != '' && isset($dept)) {
    $CLAUSE .= "
        AND dept = '" . $dept . "'
    ";
}

/**
 * Get List Karyawan
 */
$Q_Data = $DB->QueryOn(
    'cbi_hris_office',
    'karyawan',
    array(
        'id',
        'nik',
        'nama'
    ),
    $CLAUSE .
    "
        ORDER BY
            nama ASC
        LIMIT 100
    "
);
$R_Data = $DB->Row($Q_Data);

if($R_Data > 0) {
    $i = 0;
    while($Data = $DB->Result($Q_Data)) {

        $return['list_karyawan'][$i] = $Data;
        $i++;
    }
}
//=> END : Get List Karyawan

echo Core::ReturnData($return);

?>