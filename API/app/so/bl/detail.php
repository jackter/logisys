<?php
$Modid = 198;

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
    'bl'      => 'bl'
);

/**
 * Extract Detail
 */
$Q_Detail = $DB->QueryPort("
    SELECT
        H.id AS detail_id,
        H.item AS id,
        H.qty_so,
        H.qty_bl,
        I.kode AS item_kode,
        TRIM(I.nama2) AS nama,
        I.satuan,
        I.in_decimal,
        H.kode,
        H.so_kode,
        H.create_date,
        H.create_by,
        H.verified,
        H.verified_date,
        H.verified_by,
        H.approved,
        H.approved_date,
        H.approved_by,
        H.remarks
    FROM
        item AS I,
        " . $Table['bl'] . " AS H
    WHERE
        H.id = '" . $id . "' AND
        H.item = I.id
");
$R_Detail = $DB->Row($Q_Detail);
if($R_Detail > 0){
    $Detail = $DB->Result($Q_Detail);
    $return['data'] = $Detail;
    $return['data']['create_by'] = Core::GetUser("nama", $Detail['create_by']);
    if($Detail['verified_by']){
        $return['data']['verified_by'] = Core::GetUser("nama", $Detail['verified_by']);
    }
    $return['status'] = 1;
}
//=> / END : Extract Detail

echo Core::ReturnData($return);
?>