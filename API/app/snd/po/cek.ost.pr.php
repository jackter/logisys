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
 * Get Detail from Purchase Request
 */
$Q_Data = $DB->QueryPort("
    SELECT 
        id,
        item,
        qty_outstanding
    FROM
        pr_detail
    WHERE
        header = ".$pr."
        
");
$R_Data = $DB->Row($Q_Data);

if($R_Data > 0) {

    $i = 0;
    while($Data = $DB->Result($Q_Data)) {

        $return['data'][$i] = $Data;
        $i++;
    }
    
}
//=> END : Get Detail from Purchase Request

echo Core::ReturnData($return);
?>