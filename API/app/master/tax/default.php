<?php

/*Default Statement */
$return = [];
$RPL    = "";
$SENT    = Core::Extract($_POST, $RPL);

/* Extract Array */
if (isset($SENT)) {
    foreach ($SENT as $KEY => $VAL) {
        $$KEY = $VAL;
    }
}

//=> Company
include "app/_global/company.php";

$Table = array(
    'def' => 'coa_master'
);

#Get COA
/** Get Data */
$Q_Data = $DB->Query(
    $Table['def'],
    array(
        'id',
        'kode',
        'nama' 
    ),
    $CLAUSE . "
        ORDER BY kode ASC
    "
);

$R_Data = $DB->Row($Q_Data);
if ($R_Data > 0) {
    $i = 0;
    while($Data = $DB->Result($Q_Data)){
        $return[$i] = $Data;

        $i++;
    }
}

echo Core::ReturnData($return);

?>