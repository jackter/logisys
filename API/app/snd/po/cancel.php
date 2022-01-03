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
    'def'           => 'po',
    'detail'        => 'po_detail',
    'pr'            => 'pr',
    'prd'           => 'pr_detail',
    'gr'            => 'gr'
);

$LIST = json_decode($list, true);

/**
 * Update Qty Cancel
 */

$DB->ManualCommit();

for($i = 0; $i < sizeof($LIST); $i++){
    if(!empty($LIST[$i]['id'] && $LIST[$i]['qty_cancel']) > 0){
        $CurrentQtyCancel = $DB->Result($DB->Query(
            $Table['detail'],
            array(
                'qty_cancel'
            ),
            "
                WHERE
                    id = '" . $LIST[$i]['detail_id'] . "' AND
                    item = '" . $LIST[$i]['id'] . "'
            "
        ));
        $CurrentQtyCancel = ($CurrentQtyCancel['qty_cancel'] + $LIST[$i]['qty_cancel']);
        
        // Clean < 0
        if($CurrentQtyCancel < 0){
            $CurrentQtyCancel = 0;
        }

        if($DB->Update(
            $Table['detail'],
            array(
                'qty_cancel'    => $CurrentQtyCancel
            ),
            "
                id = '" . $LIST[$i]['detail_id'] . "' AND
                item = '" . $LIST[$i]['id'] . "'
            "
        )){
            /**
             * Update QTY Outstanding PR
             */

            $CurrentOutstanding = $DB->Result($DB->Query(
                $Table['prd'],
                array(
                    'qty_outstanding'
                ),
                "
                    WHERE
                        header = '" . $pr . "' AND 
                        item = '" . $LIST[$i]['id'] . "'
                "
            ));
            $NewOutstanding = ($CurrentOutstanding['qty_outstanding'] + $LIST[$i]['qty_cancel']);
            
            // Clean < 0
            if($NewOutstanding < 0){
                $NewOutstanding = 0;
            }

            $NewOutstanding = ($CurrentOutstanding['qty_outstanding'] + $LIST[$i]['qty_cancel']);

            if($DB->Update(
                $Table['prd'],
                array(
                    'qty_outstanding' => $NewOutstanding
                ),
                "
                    header = '" . $pr . "' AND 
                    item = '" . $LIST[$i]['id'] . "'
                "
            )){
                $return['detail'][$i]['update_outstanding'] = array(
                    'status'    => 1,
                    'header'    => $pr,
                    'item'      => $LIST[$i]['id']
                );
            }
            //=> / END : Update QTY Outstanding PR
        }

        if($DB->Update(
            $Table['def'],
            array(
                'total'         => $total,
                'tax_base'      => $tax_base,
                'grand_total'   => $grand_total
            ),
            "
                id = '" . $id . "'
            "
        )){

            $DB->Commit();

            $return['status'] = 1;
        }
    }
}   

/**
 * Finish Percent
 */
$AllPO = $DB->Result($DB->QueryPort("
    SELECT
        SUM(D.qty_po - D.qty_cancel) AS po
    FROM
        po AS H,
        po_detail AS D
    WHERE
        H.id = '" . $id . "' AND 
        D.header = H.id
"));
$AllPO = $AllPO['po'];
    
$Q_GR = $DB->Query(
    $Table['gr'],
    array(
        'id'
    ),
    "
        WHERE
            po = '" . $id . "'
    "
);
$R_GR = $DB->Row($Q_GR);
$AllGR = 0;
if($R_GR > 0){
    while($GR = $DB->Result($Q_GR)){

        $DGR = $DB->Result($DB->QueryPort("
            SELECT
                SUM(D.qty_receipt - D.qty_return) AS gr
            FROM
                gr AS H,
                gr_detail AS D
            WHERE
                H.id = '" . $GR['id'] . "' AND 
                D.header = H.id
        "));
        $AllGR += $DGR['gr'];
    }
}

if(
    $AllPO > 0 && 
    $AllGR > 0 && 
    $AllPO == $AllGR
){
    /**
     * Update PO to Finish
     */
    $DB->Update(
        $Table['def'],
        array(
            'finish'        => 1,
            'finish_date'   => $Date
        ),
        "id = '" . $id . "'"
    );
    //=> / END : Update PO to Finish
}
//=> / END : Finish Percent
//=> Update Qty Cancel

echo Core::ReturnData($return);

?>