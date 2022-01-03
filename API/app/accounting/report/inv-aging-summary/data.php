<?php
$Modid = 213;
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
    'def'     => 'invoice'
);


$CLAUSE = $CLAUSE2 = "";

$CLAUSE .= "
    AND ref_tgl <= '" . $tgl_aging_send . "'
";

if(!empty($company)){
    $CLAUSE .= "
        AND company = $company
    ";
    $CLAUSE2 .= "
        AND i.company = $company
    ";
}
if(!empty($supplier_kode)){
    $CLAUSE .= "
        AND supplier_kode = '".$supplier_kode."'";
    $CLAUSE2 .= "
        AND i.supplier_kode = '".$supplier_kode."'";
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
            i.supplier_kode,
            i.supplier_nama,
            i.kode,
            i.ref_tgl,
            i.amount,
            DATE_ADD( p.tanggal, INTERVAL p.payment_term DAY ) due_date,
        CASE
                
                WHEN DATEDIFF( '".$tgl_aging_send."', DATE_ADD( p.tanggal, INTERVAL p.payment_term DAY ) ) <= 0 THEN
                i.amount ELSE 0 
            END due_curr,
        CASE
                
                WHEN DATEDIFF( '".$tgl_aging_send."', DATE_ADD( p.tanggal, INTERVAL p.payment_term DAY ) ) BETWEEN 1 
                AND 30 THEN
                    i.amount ELSE 0 
                END due_30,
        CASE
                
                WHEN DATEDIFF( '".$tgl_aging_send."', DATE_ADD( p.tanggal, INTERVAL p.payment_term DAY ) ) BETWEEN 31 
                AND 60 THEN
                    i.amount ELSE 0 
                END due_60,
        CASE
                
                WHEN DATEDIFF( '".$tgl_aging_send."', DATE_ADD( p.tanggal, INTERVAL p.payment_term DAY ) ) BETWEEN 61 
                AND 90 THEN
                    i.amount ELSE 0 
                END due_90,
        CASE
                
                WHEN DATEDIFF( '".$tgl_aging_send."', DATE_ADD( p.tanggal, INTERVAL p.payment_term DAY ) ) > 90 THEN
                i.amount ELSE 0 
            END due_over_90 
        FROM
            invoice i,
            po p 
        WHERE
            i.po = p.id
            $CLAUSE2 
    ");
    $R_Data = $DB->Row($Q_Data);

    if($R_Data > 0){
        $no = 1;
        $i = 0;
        while($Data = $DB->Result($Q_Data)){

            $return['data'][$i] = $Data;
            $return['data'][$i]['no'] = $no;

            $no++;
            $i++;
        }

    }
}

echo Core::ReturnData($return);
?>