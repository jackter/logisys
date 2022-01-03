<?php
$Modid = 215;

Perm::Check($Modid, 'view');

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
    'def'     => 'sales_invoice'
);

$CLAUSE = $CLAUSE2 = "";

$CLAUSE .= "
    AND inv_tgl <= '" . $tgl_aging_send . "'
";

if(!empty($company)){
    $CLAUSE .= "
        AND company = $company
    ";
}
if(!empty($cust)){
    $CLAUSE .= "
        AND cust = '".$cust."'
    ";
}


$Check = $DB->Row($DB->Query(
    $Table['def'],
    array(
        'id'
    ),
    "
        WHERE
            id != ''
            $CLAUSE
    "
));

if($Check > 0){
    
    $Q_Data = $DB->QueryPort("
        SELECT
            cust,
            cust_kode,
            cust_nama,
            kode,
            inv_tgl,
            amount - payment_amount AS amount,
            inv_tgl AS due_date,
        CASE
                
                WHEN DATEDIFF( '".$tgl_aging_send."', inv_tgl ) <= 0 THEN
                amount ELSE 0 
            END due_curr,
        CASE
                
                WHEN DATEDIFF( '".$tgl_aging_send."', inv_tgl ) BETWEEN 1 
                AND 30 THEN
                    amount ELSE 0 
                END due_30,
        CASE
                
                WHEN DATEDIFF( '".$tgl_aging_send."', inv_tgl ) BETWEEN 31 
                AND 60 THEN
                    amount ELSE 0 
                END due_60,
        CASE
                
                WHEN DATEDIFF( '".$tgl_aging_send."', inv_tgl ) BETWEEN 61 
                AND 90 THEN
                    amount ELSE 0 
                END due_90,
        CASE
                
                WHEN DATEDIFF( '".$tgl_aging_send."', inv_tgl ) > 90 THEN
                amount ELSE 0 
            END due_over_90 

        FROM
            sales_invoice
        WHERE
            status = 1
            AND (amount - payment_amount) > 0
            $CLAUSE
    ");
    $R_Data = $DB->Row($Q_Data);

    if($R_Data > 0){
        $i = 0;
        while($Data = $DB->Result($Q_Data)){

            $return['data'][$i] = $Data;
            $i++;
        }

    }
}

echo Core::ReturnData($return);
?>