<?php

$Modid = 117;

Perm::Check($Modid, 'hapus');

//=> Default Statement
$return = [];
$RPL	= "";
$SENT   = Core::Extract($_POST, $RPL);

//=> Extract Array
if(isset($SENT)){
    foreach($SENT as $KEY => $VAL){	
        $$KEY = $VAL;
    }
}

$Table = array(
    'def'       => 'bp',
    'detail'    => 'bp_detail',
    'reff_a'    => 'invoice',
    'reff_b'    => 'sp3',
);

$DB->ManualCommit();

$Q_Detail = $DB->Query(
    $Table['detail'],
    array(
        'reff_id',
        'reff_kode',
        'total',
    ),
    "
        WHERE header = '" . $id . "'    
    "
);
$R_Detail = $DB->Row($Q_Detail);
if ($R_Detail > 0) {
    $i = 0;
    while ($Detail = $DB->Result($Q_Detail)) {
        if($reff_type == 5){
            $Invoice = $DB->Result($DB->Query(
                $Table['reff_b'],
                array(
                    'payment_amount'
                ),
                "
                    WHERE
                        id = '" . $Detail['reff_id'] . "'
                "
            ));

            $is_payment = 1;
            $new_amount = $Invoice['payment_amount'] - $Detail['total'];

            if($new_amount == 0){
                $is_payment = 0;
            }

            /**
             * Update total in invoice
             */
            $DB->QueryPort("
                UPDATE " . $Table['reff_b'] . " SET is_payment = " . $is_payment . ", payment_amount = " . $new_amount . " WHERE id = " . $Detail['reff_id'] . "
            ");
            // => End : Update total in invoice
        }
        
        // if($reff_type == 1 || $reff_type == 4){
        //     $Invoice = $DB->Result($DB->Query(
        //         $Table['reff_a'],
        //         array(
        //             'payment_amount'
        //         ),
        //         "
        //             WHERE
        //                 id = '" . $Detail['reff_id'] . "'
        //         "
        //     ));

        //     $is_payment = 1;
        //     $new_amount = $Invoice['payment_amount'] - $Detail['total'];

        //     if($new_amount == 0){
        //         $is_payment = 0;
        //     }

        //     /**
        //      * Update total in invoice
        //      */
        //     $DB->QueryPort("
        //         UPDATE " . $Table['reff_a'] . " SET is_payment = " . $is_payment . ", payment_amount = " . $new_amount . " WHERE id = " . $Detail['reff_id'] . "
        //     ");
        //     // => End : Update total in invoice
        // }
        // else{
        //     $Invoice = $DB->Result($DB->Query(
        //         $Table['reff_b'],
        //         array(
        //             'payment_amount'
        //         ),
        //         "
        //             WHERE
        //                 id = '" . $Detail['reff_id'] . "'
        //         "
        //     ));

        //     $is_payment = 1;
        //     $new_amount = $Invoice['payment_amount'] - $Detail['total'];

        //     if($new_amount == 0){
        //         $is_payment = 0;
        //     }

        //     /**
        //      * Update total in invoice
        //      */
        //     $DB->QueryPort("
        //         UPDATE " . $Table['reff_b'] . " SET is_payment = " . $is_payment . ", payment_amount = " . $new_amount . " WHERE id = " . $Detail['reff_id'] . "
        //     ");
        //     // => End : Update total in invoice
        // }
        $i++;
    }
}

if($DB->Delete(
    $Table['detail'],
    "
        header = '" . $id . "'
    "
)){

    $DB->Delete(
        $Table['def'],
        "
            id = '" . $id . "'
        "
    );

    $DB->Commit();
    $return['status'] = 1;

}else{
    $return = array(
        'status'        => 0,
        'error_msg'     => "Cannot Delete Bank Payment"
    );
}

echo Core::ReturnData($return);
?>