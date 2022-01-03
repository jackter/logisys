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
    'def'       => 'wo_equipment'
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
        AND (kode LIKE '%" . $keyword . "%')
    ";
}

/**
 * Get List
 */
$Q_Data = $DB->Query(
    $Table['def'],
    array(
        'id',
        'kode',
        'remarks'
    ),
    $CLAUSE .
    "
        ORDER BY
            kode ASC
        LIMIT 100
    "
);
$R_Data = $DB->Row($Q_Data);

if($R_Data > 0) {
    $i = 0;
    while($Data = $DB->Result($Q_Data)) {

        $return['list_equipment'][$i] = $Data;
        $i++;
    }
}
//=> END : Get List

echo Core::ReturnData($return);

?>