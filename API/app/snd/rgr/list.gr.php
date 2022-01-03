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
    'gr'        => 'gr',
    'gr_detail' => 'gr_detail',
    'po'        => 'po'
);

$CLAUSE = "";
if($keyword != '' && isset($keyword)){
    $CLAUSE .= " 
        AND gr.kode LIKE '%" . $keyword . "%'
    ";
}

/**
 * Get Data
 */
$Q_GR = $DB->QueryPort("

    SELECT
        gr.*,
        po.currency,
        po.other_cost,
        po.ppbkb,
        po.inclusive_ppn,
        (select sum(qty_po) from po_detail where header = po.id) AS sum_qty_po
    FROM
        gr,
        gr_detail AS grd,
        po
    WHERE
        gr.po = po.id
        AND grd.header = gr.id
        AND gr.inv = 0
        AND (grd.qty_receipt - grd.qty_return) > 0
        $CLAUSE
    GROUP BY
        gr.id
");
$R_GR = $DB->Row($Q_GR);
if($R_GR > 0){
    $i = 0;
    while($GR = $DB->Result($Q_GR)){
        $return[$i] = $GR;

        //get Enabled Journal
        $Q_Company = $DB->Result($DB->QueryOn(
            DB['master'],
            "company",
            array(
                'journal'
            ),
            "
                WHERE 
                    id = '" . $GR['company'] . "'
            "
        ));
        $return[$i]['enable_journal'] = $Q_Company['journal'];

        /**
         * Get Detail
         */
        $Q_Detail = $DB->QueryPort("
            SELECT
                D.id AS detail_id,
                D.item AS id,
                D.qty_receipt,
                D.qty_return AS qty,
                D.price,
                D.unit_price,
                D.storeloc,
                D.storeloc_kode,
                D.storeloc_nama,
                TRIM(I.nama) AS nama,
                I.satuan,
                I.item_type,
                I.grup,
                I.grup_nama,
                I.in_decimal
            FROM
                item AS I,
                " . $Table['gr_detail'] . " AS D
            WHERE
                D.header = '" . $GR['id'] . "' AND
                D.item = I.id
        ");
        $R_Detail = $DB->Row($Q_Detail);

        if($R_Detail > 0){
            $j = 0;
            while($Detail = $DB->Result($Q_Detail)){
                $return[$i]['list'][$j] = $Detail;

                $return[$i]['list'][$j]['qty_receipt'] = (int)$Detail['qty_receipt'];
                $return[$i]['list'][$j]['qty_max_return_def'] = (int)($Detail['qty_receipt'] - $Detail['qty']);
                $return[$i]['list'][$j]['qty_max_return'] = (int)($Detail['qty_receipt'] - $Detail['qty']);
                $return[$i]['list'][$j]['qty_return'] = 0;

                $j++;
            }
        }
        //=> END : Get Detail

        $i++;
        
    }
}
//=> END : Get Data

echo Core::ReturnData($return);
?>