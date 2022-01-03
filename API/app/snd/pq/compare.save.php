<?php
$Modid = 31;

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
    'def'       => 'pq',
    'reply'     => 'pq_supplier_reply',
    'detail'    => 'pq_supplier_reply_detail',
    'pr_detail' => 'pr_detail'
);

$data = json_decode($data, true);
$pr = json_decode($pr, true);

$DB->ManualCommit();

/**
 * Update PR
 */
for($i = 0; $i < sizeof($pr); $i++){
    if($pr[$i]['qty_cancel'] > 0){
        $UpdatePR = array(
            'qty_cancel' => $pr[$i]['qty_cancel']
        );
    }else{
        $UpdatePR = array(
            'qty_cancel' => 0
        );
    }

    // $UpdatePR['qty_outstanding'] = $pr[$i]['qty_outstanding'];

    $DB->Update(
        $Table['pr_detail'],
        $UpdatePR,
        "id = '" . $pr[$i]['detail_id'] . "'"
    );
}
//=> / END : Update PR
$ALLReply = [];
for($i = 0; $i < sizeof($data); $i++){

    $ALLReply[] = $data[$i]['id'];
    
    /**
     * Update Suplier Reply
     */
    if($DB->Update(
        $Table['reply'],
        array(
            'tipe'  => $data[$i]['tipe']
        ),
        "id = '" . $data[$i]['id'] . "'"
    )){
        $return['update'][$i] = 1;
    }
    //=> / END : Update Supplier Reply

    /**
     * Update Detail
     */
    $Detail = json_decode($data[$i]['detail'], true);
    for($j = 0; $j < sizeof($Detail); $j++){

        if($DB->Update(
            $Table['detail'],
            array(
                'qty_po'    => $Detail[$j]['qty_po']
            ),
            "
                id = '" . $Detail[$j]['id'] . "' AND 
                item = '" . $Detail[$j]['item'] . "'
            "
        )){
            $return['detail'][$j] = 1;
        }

    }
    //=> / END : Update Detail

}

$DB->Commit();

if($verify){
    $Date = date("Y-m-d H:i:s");
    $HistoryField = array(
        'table'			=> $Table['def'],
        'clause'		=> "WHERE id = '" . $id . "'",
        'action'		=> "verify",
        'description'	=> "Verify Purchase Quotations " . $kode
    );
    $History = Core::History($HistoryField);
    $Field = array(
        'verified'      => 1,
        'update_by'		=> Core::GetState('id'),
        'update_date'	=> $Date,
        'history'		=> $History
    );

    if($DB->Update(
        $Table['def'],
        $Field,
        "id = '" . $id . "'"
    )){

        //Set Null QTY PO yang suppliernnya tidak di ceklist print
        if($sup_no_print){
            if($DB->Update(
                $Table['detail'],
                array(
                    'qty_po'    => 0
                ),
                "
                    header_reply IN ( $sup_no_print )
                "
            )){
                $return['update_qty_po'] = 1;
            }
        }
        
        $DB->Commit();

        $return['status'] = 1;
    }else{
        $return = array(
            'status'    => 0,
            'error_msg' => $GLOBALS['mysql']->error
        );
    }
}

echo Core::ReturnData($return);
?>