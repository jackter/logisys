<?php
/**
 * File ini digunakan untuk mengisi field qty_outstanding
 * pada pr_detail table
 * 
 * qty_outstanding = qty_purchase - SUM(po_detail.qty_po)
 */

$Table = array(
    'pr' => 'pr',
    'prd' => 'pr_detail',
    'po' => 'po',
    'pod' => 'po_detail'
);

$Q_PR = $DB->Query(
    $Table['pr'],
    array(),
    "
        WHERE create_date >= '2019-05-03'
    "
);
$R_PR = $DB->Row($Q_PR);
if($R_PR > 0){
    while($PR = $DB->Result($Q_PR)){

        /**
         * Extract Detail
         */
        $Q_Detail = $DB->Query(
            $Table['prd'],
            array(),
            "
                WHERE
                    header = '" . $PR['id'] . "'
            "
        );
        $R_Detail = $DB->Row($Q_Detail);
        if($R_Detail > 0){
            while($Detail = $DB->Result($Q_Detail)){

                // echo $Detail['item'] . " : " . $Detail['qty_purchase'] . " - " . $PR['id'] . "<br>";

                /**
                 * Get PO
                 */
                $Q_PO = $DB->QueryPort("
                    SELECT
                        po.id,
                        pod.item,
                        qty_po
                    FROM
                        po,
                        po_detail AS pod
                    WHERE
                        po.pr = '" . $PR['id'] . "' AND 
                        pod.header = po.id AND 
                        pod.item = '" . $Detail['item'] . "'
                ");
                $R_PO = $DB->Row($Q_PO);
                $QTY_PO = 0;
                $QTY_OUT = 0;
                if($R_PO > 0){
                    while($PO = $DB->Result($Q_PO)){

                        echo $PO['id'] . " : " . $PR['id'] . " => " . $PO['item'] . " - " . $Detail['qty_purchase'] . " : " . $PO['qty_po'] . " - " . ($Detail['qty_purchase'] - $PO['qty_po']);
                        $QTY_PO += $PO['qty_po'];
                        echo "<hr>";

                    }
                }


                $QTY_OUT = $Detail['qty_purchase'] - $QTY_PO;
                if($QTY_OUT < 0){
                    $QTY_OUT = 0;
                }
                if($DB->Update(
                    $Table['prd'],
                    array(
                        'qty_outstanding' => $QTY_OUT
                    ),
                    "
                        id = '" . $Detail['id'] . "'
                    "
                )){
                    echo "<h1>" . $QTY_OUT . "</h1>";
                }
                //=> / END : Get PO

                /**
                 * Get PO
                 */
                // $Q_PO = $DB->Query(
                //     $Table['po'],
                //     array(),
                //     "
                //         WHERE
                //             pr = '" .  $PR['id']. "'
                //     "
                // );
                // $R_PO = $DB->Row($Q_PO);
                // $QTY_PO = 0;
                // if($R_PO > 0){
                //     while($PO = $DB->Result($Q_PO)){

                //         /**
                //          * Detail PO
                //          */
                //         $Q_DetailPO = $DB->Query(
                //             $Table['pod'],
                //             array(),
                //             "
                //                 WHERE
                //                     header = '" . $PO['id'] . "' AND
                //                     item = '" . $Detail['item'] . "'
                //             "
                //         );
                //         $R_DetailPO = $DB->Row($Q_DetailPO);
                //         if($R_DetailPO > 0){
                //             while($DetailPO = $DB->Result($Q_DetailPO)){
                //                 $QTY_PO += $DetailPO['qty_po'];
                //             }
                //         }
                //         //=> / END : Detail PO

                //     }
                // }
                // echo $Detail['header'] . " - " . $Detail['item'] . " - " . $Detail['qty_purchase'] . " - " . $QTY_PO . "<hr>";
                //=> / END : Get PO

            }
        }
        //=> / END : Extract Detail

    }
}
?>