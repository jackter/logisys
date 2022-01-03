<?php

#Default Statement
$return = [];
$RPL = "";
$SENT = Core::Extract($_POST, $RPL);

#Extract Array
if (isset($SENT)) {
    foreach ($SENT as $KEY => $VAL) {
        $$KEY = $VAL;
    }
}

#Total
$Q_Data = $DB->QueryPort("
        SELECT 'Outstanding' AS name, COUNT(*) total
            FROM wb_kontrak
                WHERE finish = 0
        UNION ALL

        SELECT 'Finish' AS name, COUNT(*) total
            FROM wb_kontrak
                WHERE finish = 1
       
");
$R_Data = $DB->Row($Q_Data);

if ($R_Data > 0) {
    while ($Data = $DB->Result($Q_Data)) {
        $return['wb_kontrak'][] = array(
            'name' => $Data['name'],
            'y' => (int) $Data['total']
        );
    }
}
echo Core::ReturnData($return);

?>
