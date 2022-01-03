<?php
/**
 * Document ini digunakan sebagai pembantu untuk menggenerate header_pq_supplier
 * pada table pq_supplier_reply yang merupakan dampak dari perubahan CBI-92
 */

set_time_limit(0);

$Q_PO = $DB->Query(
    'po',
    array(
        'id',
        'pq',
        'supplier'
    ),
    "
        WHERE
            header_pq_supplier = 0
    "
);
$R_PO = $DB->Row($Q_PO);
if($R_PO > 0){
    while($PO = $DB->Result($Q_PO)){

        /**
         * Select PQ_Supplier
         */
        $Q_PQ = $DB->Query(
            'pq_supplier',
            array(
                'id',
            ),
            "
                WHERE
                    header = '" . $PO['pq'] . "' AND 
                    supplier = '" . $PO['supplier'] . "'
            "
        );
        $R_PQ = $DB->Row($Q_PQ);
        if($R_PQ > 0){
            $PQ = $DB->Result($Q_PQ);

            // echo $PQ['id'] . "<br>";
            $DB->Update(
                'po',
                array(
                    'header_pq_supplier' => $PQ['id']
                ),
                "id = '" . $PO['id'] . "'"
            );

        }
        //=> / END : Select PQ_Supplier

    }
}
?>