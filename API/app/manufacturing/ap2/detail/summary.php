<?php
$Modid = 61;

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
 * Detail JO
 */
$Q_Data = $DB->QueryPort("
    SELECT
        D.id,
        D.header,
        D.tipe,
        D.item,
        I.kode,
        I.nama,
        I.is_fix,
        D.ref_qty,
        D.qty,
        D.persentase
    FROM
        jo_detail D,
        item I
    WHERE
        D.header = '" . $id . "' AND
        D.item = I.id AND
        IFNULL(I.is_fix, 0) != 1
");
$R_Data = $DB->Row($Q_Data);

if($R_Data > 0) {

    $i = 0;
    while($Data = $DB->Result($Q_Data)) {

        $return['data']['detail_jo'][$i] = $Data;
        $i++;
    }
}
//=> END : Detail JO

/**
 * Detail Receive
 */
$Q_Receive = $DB->QueryPort("
    SELECT
        D.item,
        I.kode,
        I.nama,
        I.satuan,
        SUM(D.qty_issued) as total_receive 
    FROM
        prd_issued P,
        prd_issued_detail D,
        item I
    WHERE
        D.jo = '" . $id . "' AND
        P.approved2 = 1 AND 
        D.item = I.id 
    GROUP BY
        item
");
$R_Receive = $DB->Row($Q_Receive);

if($R_Receive > 0) {
    $i = 0;
    while($Receive = $DB->Result($Q_Receive)) {

        $return['data']['detail_receive'][$i] = $Receive;
        $i++;
    }
}
//=> END : Detail Receive

/**
 * Detail Consume
 */
$Q_Consume = $DB->QueryPort("
    SELECT
        D.item,
        I.kode,
        I.nama,
        I.satuan,
        SUM(D.qty) as total_consume
    FROM
        actual_production_detail D,
        item I
    WHERE
        header IN ( SELECT id FROM actual_production WHERE jo = '" . $id . "' AND approved = 1) AND
        D.item = I.id
    GROUP BY
        item
");
$R_Consume = $DB->ROw($Q_Consume);

if($R_Consume > 0) {
    $i = 0;
    while($Consume = $DB->Result($Q_Consume)) {

        $return['data']['detail_consume'][$i] = $Consume;
        $i++;
    }
}
//=> END : Detail Consume

echo Core::ReturnData($return);
?>