<?php
$Modid = 179;
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
    'def'           => 'kontrak_invoice',
    'detail'        => 'kontrak_invoice_detail',
    'detail_progress'    => 'kontrak_progress_detail'
);

/**
 * Field
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
	'table'			=> $Table['def'],
	'clause'		=> "WHERE id = '" . $id . "'",
	'action'		=> "edit",
	'description'	=> "Edit Contract Invoice"
);
$History = Core::History($HistoryField);
$Field = array(
    'company'           => $company,
    'company_abbr'      => $company_abbr,
    'company_nama'      => $company_nama,
    'kontraktor'        => $kontraktor,
    'kontraktor_kode'   => $kontraktor_kode,
    'kontraktor_nama'   => $kontraktor_nama,
    'agreement'         => $agreement,
    'agreement_kode'    => $agreement_kode,
    'invoice_ref'       => $invoice_ref,
    'invoice_tax'       => $invoice_tax,
    'tanggal'           => $tanggal_send,
    'payment_retention' => $payment_retention,
    'currency'          => $currency,
    'ppn'               => $ppn,
    'pph_code'          => $pph_code,
    'pph'               => $pph,
    'dp_percent'        => $dp_percent,
    'total_dp'          => $total_dp,
    'total_amount'      => $total_amount,
    'total_retention'   => $total_retention,
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

    $Q_Data = $DB->Query(
        $Table['detail'],
        array(
            'detail_progress'
        ),
        "WHERE 
            header = '". $id ."'"
    );
    $R_Data = $DB->Row($Q_Data);
    
    if ($R_Data > 0) {
        while ($Data = $DB->Result($Q_Data)) {
            $FieldsDetail = array(
                'invoice'       => 0,
                'invoice_by'    => null,
                'invoice_date'  => null
            );
    
            if ($DB->Update(
                $Table['detail_progress'],
                $FieldsDetail,
                "id = '" . $Data['detail_progress'] . "' "
            )) {
                $return['status_detail_progress'][$i] = array(
                    'index' => $i,
                    'status' => 1
                );
            }
        }
    }

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
        if(!empty($list[$i]['id']) && $list[$i]['check'] == true){

            $FieldDetail = array(
                'header'            => $id,
                'detail_progress'   => $list[$i]['id'],
                'tanggal'           => $list[$i]['tanggal'],
                'coa'               => $list[$i]['coa'],
                'coa_kode'          => $list[$i]['coa_kode'],
                'coa_nama'          => $list[$i]['coa_nama'],
                'kode'              => $list[$i]['kode'],
                'progress'          => $list[$i]['progress'],
                'uom'               => $list[$i]['uom'],
                'kode'              => $list[$i]['kode'],
                'retention'         => $list[$i]['retention'],
                'amount'            => $list[$i]['amount'],
                'remarks'           => $list[$i]['remarks'],
                'status'            => 1,
            );

            if($DB->Insert(
                $Table['detail'],
                $FieldDetail
            )){
                $return['status_detail'][$i]= array(
                    'index'     => $i,
                    'status'    => 1,
                );

                $FieldsDetail = array(
                    'invoice'       => 1,
                    'invoice_by'    => Core::GetState('id'),
                    'invoice_date'  => $Date
                );
    
                if ($DB->Update(
                    $Table['detail_progress'],
                    $FieldsDetail,
                    "id = '".$list[$i]['id']. "' "
                )) {
                    $return['status_detail_progress'][$i] = array(
                        'index' => $i,
                        'status' => 1
                    );
                }

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