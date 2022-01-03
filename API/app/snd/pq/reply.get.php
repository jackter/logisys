<?php
$Modid = 31;

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
    'def'           => 'pq',
    'reply'         => 'pq_supplier_reply',
    'reply_detail'  => 'pq_supplier_reply_detail',
    'prd'           => 'pr_detail'
);

/**
 * Get Data
 */
$Q_Data = $DB->Query(
    $Table['reply'],
    array(
        'id'        => 'header_reply',
        'header',
        'header_pq_supplier',
        'reply_date',
        'lead_time',
        'supplier',
        'supplier_ref',
        'currency',
        'customs',
        'dp',
        'ppn',
        'inclusive_ppn',
        'pph_code',
        'pph',
        'IF(disc_cash <= 0, null, disc_cash)'   => 'disc_cash',
        'IF(disc_credit <= 0, null, disc_credit)'   => 'disc_credit',
        'IF(other_cost <= 0, null, other_cost)'     => 'other_cost',
        'delivery_plan',
        'payment_term',
        'expire_date'       => 'price_expire',
        'delivery_term',
        'storeloc',
        'storeloc_kode',
        'storeloc_nama',
        'weight_base',
        'po_contract',
        'other_cost',
        'ppbkb'
    ),
    "
        WHERE 
            header = '" . $header . "' AND 
            header_pq_supplier = '" . $header_pq_supplier . "'
    "
);
$R_Data = $DB->Row($Q_Data);
if($R_Data > 0){
    $Data = $DB->Result($Q_Data);

    $return['data'] = $Data;

    $return['data']['ppn'] = (int)$Data['ppn'];

    /**
     * Extract Detail
     */
    $Q_Detail = $DB->QueryPort("
        SELECT
            D.id AS detail_id,
            D.item AS id,
            D.qty_purchase,
            D.qty_supplier,
            D.prc_cash,
            D.prc_credit,
            D.origin_quality AS origin,
            D.remarks,
            D.pph,
            TRIM(I.nama) AS nama,
            I.satuan,
            I.in_decimal
        FROM
            item AS I,
            " . $Table['reply_detail'] . " AS D
        WHERE
            D.header_reply = '" . $Data['header_reply'] . "' AND
            D.item = I.id
    ");
    $R_Detail = $DB->Row($Q_Detail);

    if($R_Detail > 0){
        $i = 0;
        while($Detail = $DB->Result($Q_Detail)){
            $return['data']['list'][$i] = $Detail;
            $return['data']['list'][$i]['i'] = $i;

            /**
             * Get Up to Date PR Outstanding
             */
            $PQ = $DB->Result($DB->Query(
                $Table['def'],
                array(
                    'pr'
                ),
                "
                    WHERE
                        id = '" . $header . "'
                "
            ));
            $CurrentOutstanding = $DB->Result($DB->Query(
                $Table['prd'],
                array(
                    'qty_outstanding'
                ),
                "
                    WHERE
                        header = '" . $PQ['pr'] . "' AND 
                        item = '" . $Detail['id'] . "'
                "
            ));
            $return['data']['list'][$i]['qty_purchase'] = $CurrentOutstanding['qty_outstanding'];
            //=> / END : Get Up to Date PR Outstanding

            $return['data']['list'][$i]['pph'] = (int)$Detail['pph'];

            $i++;
        }
    }
    //=> / END : Extract Detail
}

echo Core::ReturnData($return);
?>