<?php
//=> Default Statement
$return = [];
$RPL = "";
$SENT = Core::Extract($_POST, $RPL);

//=> Extract Array
if (isset($SENT)) {
    foreach ($SENT as $KEY => $VAL) {
        $$KEY = $VAL;
    }
}

/*Total*/
$Q_Data = $DB->QueryPort("
    SELECT
        'Submited' AS name, COUNT(*) total
    FROM
        po
    WHERE
        submited = 1
    UNION ALL
    SELECT
        'Finish' AS name, COUNT(*) total
    FROM 
        po
    WHERE
        finish = 1
    UNION ALL
    SELECT
        'Force Close' AS name, COUNT(*) total
    FROM 
        po
    WHERE
        is_close = 1
");
$R_Data = $DB->Row($Q_Data);

if ($R_Data > 0) {
    while ($Data = $DB->Result($Q_Data)) {
        $return['po'][] = array(
            'name'  => $Data['name'],
            'y'     => (int) $Data['total']
        );
    }
}

echo Core::ReturnData($return);

?>
