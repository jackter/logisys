<?php
//=> Default Statement
$return = [];
$RPL	= "";
$SENT	= Core::Extract($_POST, $RPL);

//=> Extract Array
if(isset($SENT)){
    foreach($SENT as $KEY => $VAL){	
        $$KEY = $VAL;
    }
}

// $Table = array(
//     'def'       => 'mr',
// );

//=> Company
include "app/_global/company.php";

/**
 * Extract Cur
 */
$Q_Cur = $DB->Query(
    'cur',
    array(
        'id',
        'kode',
        'nama',
        'country'
    ),
    "
        WHERE
            status != 0
        ORDER BY
            id ASC
    "
);
$R_Cur = $DB->Row($Q_Cur);
if($R_Cur > 0){
    while($Cur = $DB->Result($Q_Cur)){
        $return['cur'][] = $Cur;
    }
}
//=> / END : Extract Cur

echo Core::ReturnData($return);
?>