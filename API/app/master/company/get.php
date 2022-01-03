<?php 
$Modid = 49;

Perm::Check($Modid, 'view');

/* Default Statement */
$return = [];
$RPL = "";
$SENT = Core::Extract($_POST, $RPL);

/* Extract Array */
if (isset($SENT)) {
    foreach ($SENT as $KEY => $VAL) {
        $$KEY = $VAL;
    }
}

/* Get Data*/
$Q_Data = $DB->QueryOn(
    DB['master'],
    "company",
    array(
        'id',
        'abbr',
        'nama',
        'grup',
        'status'
    ),
    "
        WHERE 
            id = '" . $id . "' 
    "
);
$R_Data = $DB->Row($Q_Data);

if ($R_Data > 0) {

    $Data = $DB->Result($Q_Data);
    
    $return['data'] = $Data;
    
}

echo Core::ReturnData($return);

?>