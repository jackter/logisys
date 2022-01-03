<?php

$Modid = 180;
Perm::Check($Modid, 'approve');

//=> Default Statement
$return = [];
$RPL    = "";
$SENT   = Core::Extract($_POST, $RPL);

//=> Extract Array
if (isset($SENT)) {
    foreach ($SENT as $KEY => $VAL) {
        $$KEY = $VAL;
    }
}
$list = json_decode($list, true);

$Table = array(
    'def'       => 'kontrak_progress',
    'detail'    => 'kontrak_agreement_detail',
    'ast_cip'   => 'ast_detail_cip',
    'pihakke3'  => 'pihakketiga_coa'
);

/**
 * Update Verify
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
	'table'			=> $Table['def'],
	'clause'		=> "WHERE id = '" . $id . "'",
	'action'		=> "approve",
	'description'	=> "Approve Contract Progress " . $kode
);
$History = Core::History($HistoryField);

$Field = array(
    'approved'      => 1,
    'approved_by'	=> Core::GetState('id'),
	'approved_date'	=> $Date,
	'history'		=> $History
);

$DB->ManualCommit();

if($enable_journal == 1){
    $Q_COA = $DB->Query(
        $Table['pihakke3'],
        array(
            'id',
            'coa_accrued',
        ),
        "WHERE 
            pihakketiga_tipe = 1
            AND company = '". $company ."'
            AND pihakketiga = '". $kontraktor ."'
            AND coa_accrued IS NOT NULL"
    );
    $R_COA = $DB->Row($Q_COA);
}

if ($R_COA > 0 || $enable_journal != 1) {
    $K_COA = $DB->Result($Q_COA);
    if ($DB->Update(
        $Table['def'],
        $Field,
        "id = '" . $id . "'"
    )) {
        for ($i = 0; $i < sizeof($list); $i++) {
            if (!empty($list[$i]['coa'])) {
                $FieldsDetail = array(
                    'current_progress'  => $list[$i]['total_progress']
                );
    
                if ($DB->Update(
                    $Table['detail'],
                    $FieldsDetail,
                    "id = '".$list[$i]['header_detail_agreement']. "' "
                )) {
                    $return['status_detail'][$i] = array(
                        'index' => $i,
                        'status' => 1,
                        'field' => $FieldsDetail
                    );
                }

                if($enable_journal == 1){
                    if($kontrak_tipe == 1){
                        $Field = array(
                            'header'        => $cip,
                            'year'          => date("Y", strtotime($tanggal_send)),
                            'month'	        => date("m", strtotime($tanggal_send)),
                            'coa_cip'	    => $list[$i]['coa'],
                            'coa_kode_cip'  => $list[$i]['coa_kode'],
                            'coa_nama_cip'  => $list[$i]['coa_nama'],
                            'doc_id'        => 15,
                            'doc_source'    => 'Contract',
                            'doc_nama'      => 'Contract Progress',
                            'ref_kode'		=> $kode,
                            'amount'		=> $list[$i]['amount']
                        );
            
                        $DB->Insert(
                            $Table['ast_cip'],
                            $Field
                        );
                    }
                    else{
                        $cip_kode = 'General';
                    }
    
                    $Jurnal = App::JurnalPosting(array(
                        'trx_type'      => 15,
                        'tipe'          => 'debit',
                        'company'       => $company,
                        'source'        => $agreement_kode,
                        'target'        => $cip_kode,
                        'currency'      => $currency,
                        'rate'          => 1,
                        'coa'           => $list[$i]['coa'],
                        'value'         => $list[$i]['amount'],
                        'kode'          => $kode,
                        'tanggal'       => $tanggal_send,
                        'keterangan'    => $list[$i]['keterangan'] . ' - ' . $list[$i]['remarks']
                    ));
    
                    $Jurnal = App::JurnalPosting(array(
                        'trx_type'      => 15,
                        'tipe'          => 'credit',
                        'company'       => $company,
                        'source'        => $agreement_kode,
                        'target'        => $kontraktor_kode,
                        'currency'      => $currency,
                        'rate'          => 1,
                        'coa'           => $K_COA['coa_accrued'],
                        'value'         => $list[$i]['amount'],
                        'kode'          => $kode,
                        'tanggal'       => $tanggal_send,
                        'keterangan'    => $list[$i]['keterangan'] . ' - ' . $list[$i]['remarks']
                    ));   
                }
            }
        }
    
        $DB->Commit();
        $return['status'] = 1;
    
    } else {
        $return = array(
            'status'    => 0,
            'error_msg' => $GLOBALS['mysql']->error
        );
    }
    // => / END: Update Approve
}
else{
    $return = array(
        'pihakketiga_coa'   => 0,
        'error_msg'         => 'Please call accounting to fill default activity/account for this contractor.'
    );
}

echo Core::ReturnData($return);

?>