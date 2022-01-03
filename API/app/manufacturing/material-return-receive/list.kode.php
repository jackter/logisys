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
    'header'    => 'prd_tf',
    'def'       => 'prd_tf_deliver',
    'detail'    => 'prd_tf_deliver_detail'
);

$CLAUSE = "";
if($keyword != '' && isset($keyword)){
    $CLAUSE .= " 
        AND D.kode LIKE '%" . $keyword . "%'
    ";
}

/**
 * Get Data
 */
$Q_Data = $DB->QueryPort("
    SELECT
        D.id,
        D.kode,
        D.rcv,
        H.company,
        H.company_abbr,
        H.company_nama,
        H.dept,
        H.dept_abbr,
        H.dept_nama
    FROM
        " . $Table['header'] . " AS H,
        " . $Table['def'] . " AS D
    WHERE
        D.prd = H.id
        AND D.approved = 1 
        AND D.rcv = 1
        $CLAUSE
");
$R_Data = $DB->Row($Q_Data);

if($R_Data > 0) {
    $i = 0;
    while($Data = $DB->Result($Q_Data)){

        $return[$i] = $Data;

        /**
         * Get Detail
         */
        $Q_Detail = $DB->QueryPort("
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
                " . $Table['detail'] . " AS D
            WHERE
                D.header = '" . $Data['id'] . "' AND
                D.item = I.id
        ");
        $R_Detail = $DB->Row($Q_Detail);

        if($R_Detail > 0) {

            $j = 0;
            while($Detail = $DB->Result($Q_Detail)) {

                $return[$i]['list'][$j] = $Detail;

                $return[$i]['list'][$j]['qty_max_return'] = $Detail['qty_receive'] - $Detail['qty_receive_return'];

                $j++;
            }

            // $j = 0;
            // while($Detail = $DB->Result($Q_Detail)){

            //     $Detail['qty_has_return'] = 0;

            //     $Q_DetailReturn = $DB->QueryPort("
            //         SELECT
            //             x.deliver,
            //             x.deliver_kode,
            //             y.item,
            //             y.qty_return
            //         FROM
            //             prd_tf_return x,
            //             prd_tf_return_detail y
            //         WHERE
            //             x.id = y.header
            //             AND x.deliver = '" . $Data['id'] . "'
            //     ");
            //     $R_DetailReturn = $DB->Row($Q_DetailReturn);

            //     if($R_DetailReturn > 0) {
            //         while($DetailReturn = $DB->Result($Q_DetailReturn)){
            //             if($Detail['item'] == $DetailReturn['item']){
            //                 $Detail['qty_has_return'] += $DetailReturn['qty_return'];
            //             }
            //         }
            //     }

            //     $return[$i]['list'][$j] = $Detail;

            //     if($Data['rcv'] == 1){
            //         $return[$i]['list'][$j]['qty_max_return'] = $Detail['qty_receive'] - $Detail['qty_has_return'];
            //     }else{
            //         $return[$i]['list'][$j]['qty_max_return'] = $Detail['qty'] - $Detail['qty_has_return'];
            //     }
            //     $j++;
            // }
        }
        //=> END : Get Detail

        $i++;
    }
}
//=> END : Get Data

echo Core::ReturnData($return);
?>