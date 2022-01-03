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
    'def'       => 'kontrak_agreement',
    'detail'    => 'kontrak_agreement_detail'
);

$CLAUSE = "
    WHERE
        company = '" . $company . "' AND
        kontraktor = '" . $kontraktor . "' AND
        status = 1 AND
        approved = 1 AND
        id NOT IN (SELECT agreement FROM kontrak_invoice)
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
    if($other_invoice_type == 0){
        $CLAUSE .= " 
            AND dp_percent > 0
        ";
    }
    else if($other_invoice_type == 1){
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
        'payment_retention',
        'currency',
        'ppn',
        'pph',
        'pph_code',
        'dp_percent'
    ),
    $CLAUSE
);
$R_Data = $DB->Row($Q_Data);

if($R_Data > 0) {
    $i = 0;
    while($Data = $DB->Result($Q_Data)) {
        $return['kontrak'][$i] = $Data;

        /**
         * Get Detail
         */
        $Q_Detail = $DB->Query(
            $Table['detail'],
            array(
                'coa',
                'coa_kode',
                'coa_nama',
                'volume',
                'rate',
                'uom',
                'amount',
                'remarks'
            ),
            "WHERE
                header = '" . $Data['id'] . "'"
        );
        $R_Detail = $DB->Row($Q_Detail);

        if($R_Detail > 0) {

            while($Detail = $DB->Result($Q_Detail)) {
                $return['kontrak'][$i]['list'][] = $Detail;
            }
        }
        //=> END : Get Detail

        $i++;
    }
}

echo Core::ReturnData($return);
?>