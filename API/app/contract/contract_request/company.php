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

//=> Company
include "app/_global/company.php";

# Get Work Code
$Work_Code = Core::GetParams(array('work_code'));
$return['work_code'] = $Work_Code['work_code'];

# Get UoM Code
$UoM = Core::GetParams(array('uom_code'));
$return['uom_code'] = $UoM['uom_code'];

/**
 * Extract Cur
 */
$Q_Cur = $DB->Query(
    'cur',
    array(
        'id',
        'kode',
        'nama'
    ),
    "
        WHERE
            status != 0
        ORDER BY
            id ASC
    "
);
$R_Cur = $DB->Row($Q_Cur);
if ($R_Cur > 0) {
    while ($Cur = $DB->Result($Q_Cur)) {
        $return['cur'][] = $Cur;
    }
}

echo Core::ReturnData($return);

?>