<?php
$Modid = 181;
Perm::Check($Modid, 'edit');

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

$list = json_decode($list, true);

$Table = array(
    'def'           => 'kontrak_agreement',
    'detail'        => 'kontrak_agreement_detail'
);

/**
 * Field
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
	'table'			=> $Table['def'],
	'clause'		=> "WHERE id = '" . $id . "'",
	'action'		=> "edit",
	'description'	=> "Edit Contract Agreement"
);
$History = Core::History($HistoryField);
$Field = array(
    'kontraktor'        => $kontraktor,
    'kontraktor_kode'   => $kontraktor_kode,
    'kontraktor_nama'   => $kontraktor_nama,
    'req'               => $req,
    'req_kode'          => $req_kode,
    'spk_kode'          => $spk_kode,
    'tanggal'           => $tanggal_send,
    'start_date'        => $start_date_send,
    'end_date'          => $end_date_send,
    'dp'                => $dp,
    'dp_amount'         => $dp_amount_show,
    'dp_percent'        => $dp_percent,
    'payment'           => $payment,
    'payment_term'      => $payment_term,
    'payment_retention' => $payment_retention,
    'currency'          => $currency,
    'ppn'               => $ppn,
    'pph_code'          => $pph_code,
    'pph'               => $pph,
    'total_amount'      => $total_amount,
    'total_ppn'         => $total_ppn,
    'total_pph'         => $total_pph,
    'grand_total'       => $grand_total,
    'remarks'           => $remarks,
    'update_by'		    => Core::GetState('id'),
	'update_date'	    => $Date,
	'history'		    => $History
);
//=> / END : Field

$DB->ManualCommit();

/**
 * Update Data
 */
if($DB->Update(
    $Table['def'],
    $Field,
    "id = '" . $id . "'"
)){

    /**
     * Delete Detail Before Insert New
     */
    $DB->Delete(
        $Table['detail'],
        "header = '" . $id . "'"
    );
    //=> / END : Delete Detail Before Insert New

    /**
     * Insert Detail
     */
    for($i = 0; $i < sizeof($list); $i++){
        if(!empty($list[$i]['coa'])){

            $FieldDetail = array(
                'header'            => $id,
                'coa'               => $list[$i]['coa'],
                'coa_kode'          => $list[$i]['coa_kode'],
                'coa_nama'          => $list[$i]['coa_nama'],
                'volume'            => $list[$i]['volume'],
                'rate'              => $list[$i]['rate'],
                'uom'               => $list[$i]['uom'],
                'amount'            => $list[$i]['amount'],
                'tanggal'           => $list[$i]['tanggal_send'],
                'remarks'           => $list[$i]['remarks']
            );

            if($DB->Insert(
                $Table['detail'],
                $FieldDetail
            )){
                $return['status_detail'][$i]= array(
                    'index'     => $i,
                    'status'    => 1,
                );

            }else{
                $return['status_detail'][$i] = array(
                    'index'     => $i,
                    'status'    => 0,
                    'error_msg' => $GLOBALS['mysql']->error
                );
            }

        }
    }
    //=> / END : Insert Detail

    $DB->Commit();
    $return['status'] = 1;
}else{
    $return = array(
        'status'    => 0,
        'error_msg' => $GLOBALS['mysql']->error
    );
}
//=> / END : Update Data

echo Core::ReturnData($return);
?>