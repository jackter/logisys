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
    'def'           => 'pq',
    'reply'         => 'pq_supplier_reply',
    'reply_detail'  => 'pq_supplier_reply_detail'
);

$data = json_decode($data, true);
$list = json_decode($quoted, true);

/**
 * Check Exists Supplier Reply
 */
$Q_Check = $DB->Query(
    $Table['reply'],
    array(
        'id'
    ),
    "
        WHERE 
            header = '" . $header . "' AND 
            header_pq_supplier = '" . $header_pq_supplier . "'
    "
);
$R_Check = $DB->Row($Q_Check);
$Edit = false;
if($R_Check > 0){
    $Check = $DB->Result($Q_Check);
    $Edit = true;
}
//=> END : Check Exists Supplier Reply

/**
 * Header Field
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
    'table'			=> $Table['reply'],
    'clause'		=> "",
    'action'		=> "add_reply",
    'description'	=> "Insert Reply from Supplier " . $data['jenis'] . " " . $data['nama']
);
$History = Core::History($HistoryField);
$Field = array(
    'header'            => $header,
    'header_pq_supplier'    => $header_pq_supplier,
    'supplier'          => $data['id'],
    'supplier_ref'      => $supplier_ref,
    'currency'          => $currency,
    'customs'           => $customs,
    'dp'                => $dp,
    'ppn'               => $ppn,
    'inclusive_ppn'     => $inclusive_ppn,
    'pph_code'          => $pph_code,
    'pph'               => $pph,
    'disc_cash'         => $disc_cash,
    'disc_credit'       => $disc_credit,
    'other_cost'        => $other_cost,
    'ppbkb'             => $ppbkb,
    'delivery_plan'     => $delivery_plan,
    'payment_term'      => $payment_term,
    'expire_date'       => $price_expire,
    'delivery_term'     => $delivery_term,
    'storeloc'          => $storeloc,
    'storeloc_kode'     => $storeloc_kode,
    'storeloc_nama'     => $storeloc_nama,
    'weight_base'       => $weight_base,
    'po_contract'       => $po_contract,
    'create_by'		    => Core::GetState('id'),
    'create_date'	    => $Date,
    'history'		    => $History,
    'status'            => 1
);
//=> / Header Field

$DB->ManualCommit();

/**
 * Insert / Update Data
 */
if($Edit){
    $DB->Update(
        $Table['reply'],
        $Field,
        "id = '" . $Check['id'] . "'"
    );

    $Header = $Check['id'];
}else{
    $DB->Insert(
        $Table['reply'],
        $Field
    );

    $Q_Header = $DB->Query(
        $Table['reply'], 
        array('id'), 
        "
            WHERE
                header = '" . $header . "' AND 
                header_pq_supplier = '" . $header_pq_supplier . "' AND 
                create_date = '" . $Date . "'
        "
    );
    $R_Header = $DB->Row($Q_Header);
    $Header = $DB->Result($Q_Header);

    $Header = $Header['id'];
}
//=> / END : Insert / Update Data

/**
 * Detail
 */
if(!empty($Header)){
    for($i = 0; $i < sizeof($list); $i++){
        //if(!empty($list[$i]['qty_supplier'])){

            $FieldDetail = array(
                'header_reply'        => $Header,
                'item'          => $list[$i]['id'],
                'qty_purchase'  => $list[$i]['qty_purchase'],
                'qty_supplier'  => $list[$i]['qty_supplier'],
                'prc_cash'      => $list[$i]['prc_cash'],
                'prc_credit'    => $list[$i]['prc_credit'],
                'origin_quality' => $list[$i]['origin'],
                'remarks'       => $list[$i]['remarks'],
                'pph'           => 0,
            );

            /**
             * Checked PPh
             */
            if($list[$i]['pph']){
                $FieldDetail['pph'] = 1;
            }
            //=> / END : Checked PPh

            $Q_CheckDetail = $DB->Query(
                $Table['reply_detail'],
                array(
                    'id'
                ),
                "
                    WHERE
                        header_reply = '" . $Header . "' AND 
                        item = '" . $list[$i]['id'] . "'
                "
            );
            $R_CheckDetail = $DB->Row($Q_CheckDetail);
            if($R_CheckDetail > 0){
                $CheckDetail = $DB->Result($Q_CheckDetail);

                $DB->Update(
                    $Table['reply_detail'],
                    $FieldDetail,
                    "id = '" . $CheckDetail['id'] . "'"
                );
            }else{
                $DB->Insert(
                    $Table['reply_detail'],
                    $FieldDetail
                );
            }

            //$return['detail'][$i] = $FieldDetail;
        //}
    }   
}
//=> / END : Detail

$DB->Commit();

$return['status'] = 1;
//$return['field'] = $Field;
//$return['list'] = $list;

echo Core::ReturnData($return);
?>