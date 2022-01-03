<?php

$Modid = 126;
Perm::Check($Modid, 'view');

//=> Default Statement
$return = [];
$RPL    = "";
$SENT   = Core::Extract($_POST, $RPL);

//=> Extract Array
if (isset($SENT)) {
    foreach ($SENT as $KEY => $VAL) {
        $$KEY = $VAL;
    }
}

$Table = array(
    'def'       => 'prd_tf_return',
    'detail'    => 'prd_tf_return_detail',
    'deliver'   => 'prd_tf_deliver_detail'
);

/**
 * Get Data
 */
$Q_Data = $DB->Query(
    $Table['def'],
    array(
        'id',
        'kode',
        'tanggal',
        'company',
        'dept',
        'deliver',
        'deliver_kode',
        'verified',
        'approved'
    ),
    "
        WHERE 
            id = '" . $id . "'
    "
);
$R_Data = $DB->Row($Q_Data);

if ($R_Data > 0) {
    $Data = $DB->Result($Q_Data);

    $return['data'] = $Data;

    /**
     * Get Detail
     */
    $Q_Detail = $DB->QueryPort("
        SELECT
            D.id_deliver_detail,
            D.storeloc,
            D.storeloc_kode,
            D.storeloc_nama,
            D.item,
            D.qty_ref,
            D.qty_return,
            D.price,
            D.remarks,
            TRIM(I.nama) AS nama,
            I.satuan,
            I.in_decimal
        FROM
            item AS I,
            " . $Table['detail'] . " AS D
        WHERE
            D.header = '" . $Data['id'] . "' AND
            D.item = I.id
    
    ");
    $R_Detail = $DB->Row($Q_Detail);

    if ($R_Detail > 0) {

        $i = 0;
        while ($Detail = $DB->Result($Q_Detail)) {

            $return['data']['detail_return'][$i] = $Detail;
            $i++;
        }
    }
    //=> END : Get Detail

    # Get Detail Deliver
    $Q_Deliver = $DB->QueryPort("
    SELECT
        D.id,
        D.storeloc,
        D.storeloc_kode,
        D.storeloc_nama,
        D.item,
        D.qty_ref,
        D.qty,
        D.qty_receive,
        D.qty_receive_return,
        D.price,
        D.remarks,
        TRIM(I.nama) AS nama,
        I.satuan,
        I.in_decimal
    FROM
        item AS I,
        " . $Table['deliver'] . " AS D
    WHERE
        D.header = '" . $Data['deliver'] . "' AND
        D.item = I.id
");
    $R_Deliver = $DB->Row($Q_Deliver);

    if ($R_Deliver > 0) {

        $i = 0;
        while ($Deliver = $DB->Result($Q_Deliver)) {

            $return['data']['detail'][$i] = $Deliver;

            $return['data']['detail'][$i]['qty_max_return'] = $Deliver['qty'] - $Deliver['qty_return'];
            $i++;
        }
    }
}
//=> / END : Get Data

echo Core::ReturnData($return);

?>