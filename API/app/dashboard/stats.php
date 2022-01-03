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

$Table = array(
    'mr'       => 'mr',
    'po'       => 'po',
    'pr'       => 'pr'
);

/**
 * Total Outstanding PO
 */
$Q_Data = $DB->QueryPort("
    SELECT
        'PO' AS name, COUNT(*) total
    FROM
        po
    WHERE
        finish = 0
    UNION ALL
    SELECT
        'PR' AS name, COUNT(*) total
    FROM 
        pr
    WHERE
        finish = 0
");
$R_Data = $DB->Row($Q_Data);

if($R_Data > 0){
    while($Data = $DB->Result($Q_Data)){
        $return['outstanding'][] = array(
            'name'  => $Data['name'],
            'y'     => (int)$Data['total']
        );
    }
}
//=> END : Total Outstanding PO
echo Core::ReturnData($return);
?>