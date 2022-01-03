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
 * Get Detail from Reply Supplier
 */
$Q_Data = $DB->QueryPort("
    SELECT 
        D.id,
        D.item,
        D.qty_purchase,
        D.qty_supplier,
        D.prc_cash,
        D.prc_credit,
        D.origin_quality,
        D.remarks,
        D.pph
    FROM
        pq AS P,
        pq_supplier AS PS,
        pq_supplier_reply AS S,
        pq_supplier_reply_detail AS D
    WHERE
        P.pr = '" . $pr . "' AND
        PS.header = P.id AND
        PS.supplier = '" . $supplier . "' AND
        S.header = P.id AND
        S.header_pq_supplier = PS.id AND
        D.header_reply = S.id
        
");
$R_Data = $DB->Row($Q_Data);

if($R_Data > 0) {

    $i = 0;
    while($Data = $DB->Result($Q_Data)) {

        $return['data'][$i] = $Data;
        $i++;
    }
    
}
//=> END : Get Detail from Reply Supplier

echo Core::ReturnData($return);
?>