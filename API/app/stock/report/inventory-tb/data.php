<?php
$Modid = 89;

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
    'stock'         => 'stock'
);

$CLAUSE .= "
    AND tanggal BETWEEN '" . $fdari . "' AND '" . $fhingga . "'
";

$CLAUSE2 = $CLAUSE;

if(!empty($company)){
    $CLAUSE .= "
        AND company = $company
    ";
    $CLAUSE2 .= "
        AND st.company = $company
    ";
}
if(!empty($storeloc)){
    $CLAUSE .= "
        AND storeloc = $storeloc
    ";
    $CLAUSE2 .= "
        AND st.storeloc = $storeloc
    ";
}

$Check = $DB->Row($DB->Query(
    $Table['stock'],
    array(
        'id'
    ),
    "
        WHERE
            id != ''
            $CLAUSE
    "
));

if($Check > 0){
    
    $Q_Data = $DB->QueryPort("
    SELECT
        ic.coa_kode_persediaan coa_kode,
        ic.coa_nama_persediaan coa_nama,
        st.item,
        st.storeloc,
        st.saldo opening,
        ( st.saldo * st.price ) opening_amt,
        sum( st.debit ) debit,
        sum( st.debit * st.price ) debit_amt,
        sum( st.credit ) credit,
        sum( st.credit * st.price ) credit_amt 
    FROM
        stock st,
        item_coa ic 
    WHERE
        st.item = ic.item_id 
        AND ic.item_type = 1 
        AND st.company = ic.company 
        $CLAUSE2 
    GROUP BY
        ic.coa_kode_persediaan,
        st.item,
        st.storeloc 
    ORDER BY
        ic.coa_kode_persediaan,
        st.create_date,
        st.storeloc
    ");
    $R_Data = $DB->Row($Q_Data);

    if($R_Data > 0){
        $i = 0;
        while($Data = $DB->Result($Q_Data)){

            $return['data'][$i] = $Data;

            /**
             * Saldo Awal
             */
            // if(!empty($Data['is_stock'])){
            //     $SaldoAwal = 0;
            //     $Q_SA = $DB->Query(
            //         $Table['stock'],
            //         array(
            //             'saldo'
            //         ),
            //         "
            //             WHERE
            //                 item = '" . $Data['id'] . "'
            //                 $CLAUSE
            //             ORDER BY
            //                 create_date ASC
            //         "
            //     );
            //     $R_SA = $DB->Row($Q_SA);
            //     if($R_SA > 0){
            //         $SA = $DB->Result($Q_SA);
            //         $SaldoAwal = $SA['saldo'];
            //     }
            //     $return['data'][$i]['saldo'] = $SaldoAwal;
            // }
            //=> / END : Saldo Awal

            /**
             * Saldo Akhir
             */
            // if(!empty($Data['is_stock'])){
            //     $SaldoAkhir = 0;
            //     $Q_SA = $DB->Query(
            //         $Table['stock'],
            //         array(
            //             'SUM(saldo_akhir)'  => 'saldo_akhir'
            //             // 'saldo_akhir'
            //         ),
            //         "
            //             WHERE
            //                 id IN (
            //                     SELECT 
            //                         MAX(id)
            //                     FROM 
            //                         stock
            //                     WHERE
            //                         item = '" . $Data['id'] . "'
            //                         $CLAUSE
            //                     GROUP BY
            //                         storeloc,
            //                         item
            //                 )
            //                 $CLAUSE
            //             ORDER BY
            //                 create_date DESC,
            //                 id DESC
            //         "
            //     );
            //     $R_SA = $DB->Row($Q_SA);
            //     if($R_SA > 0){
            //         $SA = $DB->Result($Q_SA);
            //         $SaldoAkhir = $SA['saldo_akhir'];
            //     }
            //     $return['data'][$i]['saldo_akhir'] = $SaldoAkhir;
            // }
            //=> / END : Saldo Akhir

            $i++;
        }

    }
}

echo Core::ReturnData($return);
//echo json_encode($return);

/*array_walk_recursive( $return, function(&$item) { 
    $item = mb_convert_encoding( $item, 'UTF-8' ); 
    //$item = htmlspecialchars(html_entity_decode($item, ENT_QUOTES, 'UTF-8'), ENT_QUOTES, 'UTF-8');
});
echo json_encode($return);*/
?>