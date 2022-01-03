<?php
/**
 * Document ini digunakan sebagai pembantu untuk menggenerate header_pq_supplier
 * pada table pq_supplier_reply yang merupakan dampak dari perubahan CBI-92
 */

set_time_limit(0);

$Table = array(
    'supplier' => 'pq_supplier',
    'reply'    => 'pq_supplier_reply'
);

$Q_Reply = $DB->Query(
    $Table['reply'],
    array(),
    "
        WHERE
            header_pq_supplier = 0
    "
);
$R_Reply = $DB->Row($Q_Reply);
if($R_Reply > 0){
    while($Reply = $DB->Result($Q_Reply)){

        $Supplier = $DB->Result($DB->Query(
            $Table['supplier'],
            array(),
            "
                WHERE
                    header = '" . $Reply['header'] . "' AND 
                    supplier = '" . $Reply['supplier'] . "'
            "
        ));

        echo $Reply['id'] . " -> Header PQ = " . $Supplier['id'] . "<hr>";

        /**
         * Update
         */
        $DB->Update(
            $Table['reply'],
            array(
                'header_pq_supplier' => $Supplier['id']
            ),
            "id = '" . $Reply['id'] . "'"
        );
        //=> / END : Update

    }
}
?>