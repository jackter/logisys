<?php

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
    'gi'        => 'gi',
    'gi_detail' => 'gi_detail',
);

$CLAUSE = "";
if($keyword != '' && isset($keyword)){
    $CLAUSE .= " 
        AND gi.kode LIKE '%" . $keyword . "%'
    ";
}

$Q_GI = $DB->QueryPort("
    SELECT
        gi.*
    FROM
        gi,
        gi_detail AS gid
    WHERE
        gid.header = gi.id
        $CLAUSE
    GROUP BY
        gi.id
    LIMIT 50
");
$R_GI = $DB->Row($Q_GI);
if($R_GI > 0 ){
    $i = 0;
    while($GI = $DB->Result($Q_GI)){

        $return[$i] = $GI;

        //get Enabled Journal
        $Q_Company = $DB->Result($DB->QueryOn(
            DB['master'],
            "company",
            array(
                'journal'
            ),
            "
                WHERE 
                    id = '" . $GI['company'] . "'
            "
        ));
        $return[$i]['enable_journal'] = $Q_Company['journal'];

        /**
         * GET DETAIL
         */
        $Q_Detail = $DB->QueryPort("
            SELECT
                D.id AS detail_id,
                D.item AS id,
                D.qty_gi AS qty_issued,
                D.qty_return AS qty,
                D.qty_gi - D.qty_return AS qty_max_return,
                D.price,
                D.storeloc,
                D.storeloc_kode,
                D.storeloc_nama,
                D.cost_center,
                D.cost_center_kode,
                D.cost_center_nama,
                TRIM(I.nama) AS nama,
                I.satuan,
                I.item_type,
                I.grup,
                I.grup_nama,
                I.in_decimal
            FROM
                item AS I,
                " . $Table['gi_detail'] . " AS D
            WHERE
                D.header = '" . $GI['id'] . "' AND
                D.item = I.id
        ");
        $R_Detail = $DB->Row($Q_Detail);

        if($R_Detail > 0){
            $j = 0;
            while($Detail = $DB->Result($Q_Detail)){
                $return[$i]['list'][$j] = $Detail;

                // $return[$i]['list'][$j]['qty_receipt'] = (int)$Detail['qty_receipt'] - $Detail['qty'];
                $return[$i]['list'][$j]['qty_issued'] = $Detail['qty_issued'];
                $return[$i]['list'][$j]['qty_max_return'] = $Detail['qty_max_return'];
                $return[$i]['list'][$j]['qty_return'] = 0;
                $return[$i]['list'][$j]['selected'] = 1;

                $j++;
            }
        }

        // => AND DETAIL

        $i++;
    }
}

echo Core::ReturnData($return);
?>