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
    'item'      => 'item',
    'item_coa'  => 'item_coa'
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
        G.id gr,
        G.kode AS gr_kode,
        P.dp,
        GD.item,
        GD.qty_receipt,
        GD.qty_return,
        GD.price,
        I.nama,
        IC.coa_beban,
        IC.coa_kode_beban,
        IC.coa_nama_beban
    FROM
        " . $Table['po'] . " AS P,
        " . $Table['gr'] . " AS G,
        " . $Table['gr_detail'] . " AS GD,
        " . $Table['item'] . " AS I,
        " . $Table['item_coa'] . " AS IC
    WHERE
        P.id = G.po
        AND G.id = GD.header
        AND GD.item = I.id
        AND I.item_type = 2
        AND I.sub_item_type = 1
        AND I.id = IC.item_id
        AND IC.company = P.company
        $CLAUSE
        AND concat(GD.header, '|', GD.item) not in (select concat(ast.gr, '|', ast.item) from ast where verified = 1)
    GROUP BY
        G.po
    ORDER BY 
        G.tanggal DESC
    LIMIT
        20
");

$R_GRPO = $DB->Row($Q_GRPO);
if($R_GRPO > 0){
    $i = 0;
    while($GRPO = $DB->Result($Q_GRPO)){

        $return[$i] = $GRPO;

        // $Q_GRN = $DB->Query(
        //     $Table['gr'],
        //     array(
        //         'id'    => 'grn',
        //         'kode'  => 'grn_kode',
        //         'tanggal'
        //     ),
        //     "
        //         WHERE
        //             po = '" . $GRPO['po'] . "' AND
        //             inv = 0
        //     "
        // );
        // $R_GRN = $DB->Row($Q_GRN);
        // if($R_GRN > 0){
            
        //     $j = 0;
        //     while($GRN = $DB->Result($Q_GRN)){

        //         $return[$i]['list'][$j] = $GRN;

        //         /**
        //          * Get Detail Item
        //          */
        //         $Q_Detail = $DB->QueryPort("
        //             SELECT
        //                 h.ppn, 
        //                 h.pph, 
        //                 h.other_cost, 
        //                 h.disc,
        //                 d.item, 
        //                 d.qty_po, 
        //                 gd.qty_receipt AS qty,
        //                 gd.qty_return,  
        //                 gd.price AS price_gr, 
        //                 d.price,  
        //                 d.pph pph_flag
        //             FROM
        //                 " . $Table['po'] . " AS h,
        //                 " . $Table['po_detail'] . " AS d,
        //                 " . $Table['gr'] . " AS g,
        //                 " . $Table['gr_detail'] . " AS gd
        //             WHERE
        //                 g.id IN (".$GRN['grn'].") and
        //                 h.id = d.header and 
        //                 h.id = g.po and 
        //                 g.id = gd.header and 
        //                 d.item = gd.item and
        //                 concat(gd.header, '|', d.item) not in (select concat(ast.gr, '|', ast.item) from ast)
        //         ");
        //         $R_Detail = $DB->Row($Q_Detail);
        
        //         if($R_Detail > 0){
        //             $k = 0;
        //             while($Detail = $DB->Result($Q_Detail)){
        
        //                 $return[$i]['list'][$j]['item'][$k] = $Detail;
    
        //                 $k++;
        //             }
                    
        //         }
        //         //=> / END : Detail Item
        //         $j++;
        //     }

        // }
        $i++;
    }

}

echo Core::ReturnData($return);
?>