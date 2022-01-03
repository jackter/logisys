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

/**
 * Total
 */
$Q_Data = $DB->QueryPort("
    SELECT
        'Invoiced' AS name, COUNT(*) total
    FROM
        gr
    WHERE
        inv != 0
    UNION ALL
    SELECT
        'Outstanding Invoice' AS name, COUNT(*) total
    FROM 
        gr
    WHERE
        inv = 0
");
$R_Data = $DB->Row($Q_Data);

if($R_Data > 0){
    while($Data = $DB->Result($Q_Data)){
        $return['gr'][] = array(
            'name'  => $Data['name'],
            'y'     => (int)$Data['total']
        );
    }
}
//=> END : Total
echo Core::ReturnData($return);
?>