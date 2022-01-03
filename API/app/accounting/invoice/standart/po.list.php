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
    'po'        => 'po',
    'gr'        => 'gr',
    'gr_detail' => 'gr_detail',
    'po_detail' => 'po_detail',
    'inv'       => 'invoice'
);

$CLAUSE = "";
if($keyword != '' && isset($keyword)){
    $CLAUSE .= " 
        AND P.kode LIKE '%" . $keyword . "%'
    ";
}
if($company != '' && isset($company)){
    $CLAUSE .= "
        AND P.company = '" . $company . "'
    ";
}
if($supplier != '' && isset($supplier)){
    $CLAUSE .= "
        AND P.supplier = '" . $supplier . "'
    ";
}

$Q_GRPO = $DB->QueryPort("
    SELECT
        G.company,
        G.company_abbr,
        G.company_nama,
        G.dept,
        G.dept_abbr,
        G.dept_nama,
        G.supplier,
        G.supplier_kode,
        G.supplier_nama,
        G.po,
        G.po_kode AS kode,
        P.dp,
        P.inclusive_ppn,
        P.total
    FROM
        " . $Table['po'] . " AS P,
        " . $Table['gr'] . " AS G
    WHERE
        P.id = G.po
        AND G.inv = 0
        AND IFNULL(P.weight_base,0) = 0
        $CLAUSE
    GROUP BY
        G.po
    LIMIT
        20
");
$R_GRPO = $DB->Row($Q_GRPO);
if($R_GRPO > 0){
    $i = 0;
    while($GRPO = $DB->Result($Q_GRPO)){

        $return[$i] = $GRPO;

        // $Q_INV = $DB->QueryPort("
        //     SELECT
        //         h.dp,
        //         h.disc,
        //         h.other_cost,
        //         h.ppbkb,
        //         d.qty_po qty,
        //         d.price,
        //         h.ppn,
        //         h.inclusive_ppn,
        //         h.pph * d.pph pph
        //     FROM
        //         po h,
        //         po_detail d
        //     WHERE
        //         h.id = " . $GRPO['po'] . " 
        //         AND h.id = d.header 
        // ");
        // $R_INV = $DB->Row($Q_INV);
        // if($R_INV > 0){
        //     $j = 0;
        //     while($INV = $DB->Result($Q_INV)){
        //         $return[$i]['data_dp'][$j] = $INV;
        //         $j++;
        //     }
        // }

        $Q_PO_DETAIL = $DB->Result($DB->Query(
            $Table['po_detail'],
            array(
                'sum(qty_po)' => 'total_qty_po'
            ),
            "
                WHERE
                    header = '".$GRPO['po']."'
            "
        ));
    
        $return[$i]['total_qty_po'] = $Q_PO_DETAIL['total_qty_po'];

        /**
         * Get Invoice Amount
         */
        // $Q_INV = $DB->Query(
        //     $Table['inv'],
        //     array(
        //         // 'SUM(amount)' => 'amount',
        //         'amount'
        //     ),
        //     "
        //         WHERE
        //             po = '" . $GRPO['po'] . "'
        //     "
        // );
        // $R_INV = $DB->Row($Q_GRPO);
        // if($R_INV > 0){
        //     $INV = $DB->Result($Q_INV);

        //     $return[$i]['dp_amount'] = $INV['amount'];
        // }
        //=> / END : Get Invoice Amount

        $Q_GRN = $DB->Query(
            $Table['gr'],
            array(
                'id'    => 'grn',
                'kode'  => 'grn_kode',
                'tanggal'
            ),
            "
                WHERE
                    po = '" . $GRPO['po'] . "' AND
                    inv = 0
            "
        );
        $R_GRN = $DB->Row($Q_GRN);
        if($R_GRN > 0){
            
            $j = 0;
            while($GRN = $DB->Result($Q_GRN)){

                $return[$i]['list'][$j] = $GRN;

                /**
                 * Get Detail Item
                 */
                $Q_Detail = $DB->QueryPort("
                    SELECT
                        h.ppn,
                        h.inclusive_ppn, 
                        h.pph, 
                        h.other_cost, 
                        h.ppbkb, 
                        h.disc,
                        d.item, 
                        d.qty_po, 
                        (gd.qty_receipt - gd.qty_return) AS qty, 
                        gd.price AS price_gr, 
                        d.price,  
                        d.pph pph_flag
                    FROM
                        " . $Table['po'] . " AS h,
                        " . $Table['po_detail'] . " AS d,
                        " . $Table['gr'] . " AS g,
                        " . $Table['gr_detail'] . " AS gd
                    WHERE
                        g.id IN (".$GRN['grn'].") and
                        h.id = d.header and 
                        h.id = g.po and 
                        g.id = gd.header and 
                        d.item = gd.item
                ");
                $R_Detail = $DB->Row($Q_Detail);
        
                if($R_Detail > 0){
                    $k = 0;
                    while($Detail = $DB->Result($Q_Detail)){
        
                        $return[$i]['list'][$j]['item'][$k] = $Detail;
    
                        $k++;
                    }
                    
                }
                //=> / END : Detail Item
                $j++;
            }

        }
        $i++;
    }

}

echo Core::ReturnData($return);
?>