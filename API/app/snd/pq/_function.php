<?php
/**
 * Total Quotations
 */
function Apvd($id){

    // $DB = new DB;
    global $DB;

    $Table = array(
        'reply'     => 'pq_supplier_reply',
        'detail'    => 'pq_supplier_reply_detail'
    );

    $Apvd = 3;

    /**
     * Get Reply
     */
    $Q_Reply = $DB->Query(
        $Table['reply'],
        array(
            'id',
            'supplier',
            'tipe'
        ),
        "
            WHERE
                header = '" . $id . "'
        "
    );
    $R_Reply = $DB->Row($Q_Reply);
    if($R_Reply > 0){
        $Total = 0;
        while($Reply = $DB->Result($Q_Reply)){

            $SA = array(
                'qty_po * prc_credit'   => 'price'
            );
            if($Reply['tipe'] == 'cash'){
                $SA = array(
                    'qty_po * prc_cash'   => 'price'
                );  
            }

            /**
             * Total
             */
            $Q_Total = $DB->Query(
                $Table['detail'],
                $SA,
                "
                    WHERE
                        header_reply = '" . $Reply['id'] . "'
                    ORDER BY
                        price DESC
                "
            );
            $R_Total = $DB->Row($Q_Total);
            if($R_Total > 0){
                while($TTotal = $DB->Result($Q_Total)){
                    $Total += $TTotal['price'];
                }

            }
            //=> / END : Total

        }

        if($Total > 0 && $Total <= 5000000){
            $Apvd = 1;
        }elseif($Total > 5000000 && $Total <= 50000000){
            $Apvd = 2;
        }
        
    }
    //=> / END : Get Reply

    return $Apvd;
}
//=> / END : Total Quotations
?>