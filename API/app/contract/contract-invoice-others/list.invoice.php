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
    'def'       => 'kontrak_invoice',
    'coa_bal'   => 'trx_coa_balance'
);

$CLAUSE = "
    WHERE
        company = '" . $company . "' AND
        kontraktor = '" . $kontraktor . "' AND
        status = 1 AND
        approved = 1 AND
        kode NOT IN (SELECT kode FROM kontrak_invoice WHERE tipe = 2)
";

if($keyword != '' && isset($keyword)){
    $CLAUSE .= " 
        AND kode LIKE '%" . $keyword . "%'
    ";
}

if($tanggal != '' && isset($tanggal)){
    $CLAUSE .= " 
        AND tanggal <= '" . $tanggal . "' 
    ";
}

if($other_invoice_type != '' && isset($other_invoice_type)){
    if($other_invoice_type == 1){
        $CLAUSE .= " 
            AND payment_retention > 0
        ";
    }
}

$Q_Data = $DB->Query(
    $Table['def'],
    array(
        'id',
        'kode',
        'agreement',
        'agreement_kode',
        'payment_retention',
        'currency',
        'total_retention',
        'ppn',
        'pph',
        'pph_code'
    ),
    $CLAUSE
);
$R_Data = $DB->Row($Q_Data);

if($R_Data > 0) {
    $i = 0;
    while($Data = $DB->Result($Q_Data)) {
        $return['invoice'][$i] = $Data;

        /**
         * Get Detail
         */
        $Q_Detail = $DB->Query(
            $Table['coa_bal'],
            array(
                'coa',
                'coa_kode',
                'coa_nama'
            ),
            "WHERE
                doc_nama = 'Contract Invoice Others'
                AND seq = 2
                AND company = '" . $company . "'"
        );
        $R_Detail = $DB->Row($Q_Detail);

        if($R_Detail > 0) {

            while($Detail = $DB->Result($Q_Detail)) {
                $Detail['remarks'] = 'Invoice Retensi untuk '.$Data['kode'];
                $Detail['amount'] = $Data['total_retention'];
                $return['invoice'][$i]['list'][] = $Detail;
            }
        }
        //=> END : Get Detail

        $i++;
    }
}

echo Core::ReturnData($return);
?>