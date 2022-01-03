<?php

$return = [];
$RPL    = "";
$SENT   = Core::Extract($_POST, $RPL);

if (isset($SENT)) {
    foreach ($SENT as $KEY => $VAL) {
        $$KEY = $VAL;
    }
}

$Table = array(
    'def'       => 'coa_master'
);
/**
 * Filter
 */
$CLAUSE = "
    WHERE 
        id != ''
";

if ($keyword != '' && isset($keyword)) {
    $CLAUSE .= " 
        AND (kode LIKE '%" . $keyword . "%' OR nama LIKE '%" . $keyword . "%')
    ";
}

if ($company != '' && isset($company)) {
    $CLAUSE .= "
        AND company = '" . $company . "'
    ";
}

/**
 * Extract Data
 */
$Q_Data = $DB->Query(
    $Table['def'],
    array('id'),
    $CLAUSE
);
$R_Data = $DB->Row($Q_Data);
if ($R_Data > 0) {


    $Q_Data = $DB->Query(
        $Table['def'],
        array(
            'id',
            'kode',
            'nama'
        ),
        $CLAUSE . "
            ORDER BY
                kode
            LIMIT 50
        "
    );

    $i = 0;
    while ($Data = $DB->Result($Q_Data)) {

        $return[$i] = $Data;

        $i++;
    }
}

echo Core::ReturnData($return);

?>