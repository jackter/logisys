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

$CLAUSE = "
    WHERE
        company = '" . $company . "' AND
        kontraktor = '" . $kontraktor . "' AND
        approved = 1
";

if($keyword != '' && isset($keyword)){
    $CLAUSE .= " 
        AND agreement_kode LIKE '%" . $keyword . "%'
    ";
}

if($tanggal != '' && isset($tanggal)){
    $CLAUSE .= " 
        AND tanggal <= '" . $tanggal . "' 
    ";
}

$Agreement = "";
$Progress = "";

$Q_Data = $DB->Query(
    'kontrak_progress',
    array(
        'id',
        'agreement'
    ),
    $CLAUSE
);
$R_Data = $DB->Row($Q_Data);

if($R_Data > 0){
    $i = 0;
    while($Data = $DB->Result($Q_Data)) {
        if($i == 0){
            $Agreement .= $Data['agreement'];
            $Progress .= $Data['id'];
        }
        else{
            $Agreement .= ','.$Data['agreement'];
            $Progress .= ','.$Data['id'];
        }
        $i++;
    }
}

$CLAUSE_AGREEMENT = "";
if($Agreement != ""){
    $CLAUSE_AGREEMENT = "A.id in (" . $Agreement . ") AND";
}

$CLAUSE_PROGRESS = "";
if($Progress != ""){
    $CLAUSE_PROGRESS = "P.id in (" . $Progress . ") AND";
}

if($CLAUSE_AGREEMENT != "" && $CLAUSE_PROGRESS != ""){
    $Q_Data = $DB->QueryPort("
        SELECT
            A.id,
            A.kode,
            A.payment_retention,
            A.currency,
            A.ppn,
            A.pph,
            A.pph_code,
            A.dp_percent
        FROM
            kontrak_agreement A
        WHERE
            " . $CLAUSE_AGREEMENT . "
            A.approved = 1 AND
            A.id IN (SELECT agreement FROM kontrak_progress x, kontrak_progress_detail y WHERE x.approved = 1 AND x.status = 1 AND x.id = y.header AND IFNULL(y.invoice, 0) != 1) AND
            A.status = 1
        ORDER BY
            A.kode
    ");
    $R_Data = $DB->Row($Q_Data);
}

if($R_Data > 0) {
    $i = 0;
    while($Data = $DB->Result($Q_Data)) {
        $return['kontrak'][$i] = $Data;

        /**
         * Get Detail
         */
        $Q_Detail = $DB->QueryPort("
        SELECT
            D.id,
            P.kode,
            P.tanggal,
            D.coa,
            D.coa_kode,
            D.coa_nama,
            D.current_progress,
            D.progress,
            D.amount,
            D.uom,
            D.remarks
        FROM
            kontrak_progress P,
            kontrak_progress_detail D
        WHERE
            " . $CLAUSE_PROGRESS . "
            P.agreement = '" . $Data['id'] . "' AND
            P.id = D.header AND
            D.invoice != 1
        ");
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