<?php
/**
 * Total Estimated
 */
function Apvd($id){

    // $DB = new DB;
    global $DB;

    $Table = array(
        'detail'    => 'pr_detail'
    );

    $Total = 0;
    $Q_Total = $DB->Query(
        $Table['detail'],
        array(
            'est_price * qty_purchase'    => 'est_price'
        ),
        "
            WHERE
                header = '" . $id . "'
            ORDER BY
                est_price DESC
        "
    );
    $R_Total = $DB->Row($Q_Total);
    if($R_Total > 0){
        $TTotal = $DB->Result($Q_Total);
        // if($TTotal > 0){
            $Total = $TTotal['est_price'] * $TTotal['qty_purchase'];
        // }
    }

    $Apvd = 3;
    if($Total > 0 && $Total <= 20000000){
        $Apvd = 1;
    }elseif($Total > 20000000 && $Total <= 50000000){
        $Apvd = 2;
    }

    return $Apvd;
}
//=> / END : Total Estimated
?>