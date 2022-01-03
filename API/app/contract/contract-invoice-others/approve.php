<?php
$Modid = 178;
Perm::Check($Modid, 'approve');

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
    'def'       => 'kontrak_invoice',
    'pihakke3'  => 'pihakketiga_coa',
    'coa_bal'   => 'trx_coa_balance'
);

/**
 * Update Approve
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
	'table'			=> $Table['def'],
	'clause'		=> "WHERE id = '" . $id . "'",
	'action'		=> "approve",
	'description'	=> "Approve Contract Invoice"
);
$History = Core::History($HistoryField);

$Field = array(
    'approved'      => 1,
    'approved_by'	=> Core::GetState('id'),
	'approved_date'	=> $Date,
	'history'		=> $History
);

$DB->ManualCommit();

$Q_COA = $DB->Query(
    $Table['pihakke3'],
    array(
        'id',
        'coa',
        'coa_accrued',
    ),
    "WHERE 
        pihakketiga_tipe = 1
        AND company = '". $company ."'
        AND pihakketiga = '". $kontraktor ."'
        AND coa_accrued IS NOT NULL"
);
$R_COA = $DB->Row($Q_COA);

if ($R_COA > 0) {
    $K_COA = $DB->Result($Q_COA);

    if($DB->Update(
        $Table['def'],
        $Field,
        "id = '" . $id . "'"
    )){
    
        if($enable_journal == 1){
            $Q_COA_Bal = $DB->Query(
                $Table['coa_bal'],
                array(
                    'coa'
                ),
                "WHERE 
                    doc_nama = 'Contract Invoice Others' 
                    AND seq = 1"
            );
            $R_COA_Bal = $DB->Row($Q_COA_Bal);
            
            if ($R_COA_Bal > 0) {
                $COA_Bal = $DB->Result($Q_COA_Bal);

                // for ($i = 0; $i < sizeof($list); $i++) {
                //     $Jurnal = App::JurnalPosting(array(
                //         'trx_type'      => 16,
                //         'tipe'          => 'debit',
                //         'company'       => $company,
                //         'source'        => $agreement_kode,
                //         'target'        => 'Cost Book',
                //         'currency'      => $currency,
                //         'rate'          => 1,
                //         'coa'           => $list[$i]['coa'],
                //         'value'         => $list[$i]['amount'],
                //         'kode'          => $kode,
                //         'tanggal'       => $tanggal_send,
                //         'keterangan'    => $list[$i]['keterangan'] . ' - ' . $list[$i]['remarks']
                //     ));
    
                //     $Jurnal = App::JurnalPosting(array(
                //         'trx_type'      => 16,
                //         'tipe'          => 'credit',
                //         'company'       => $company,
                //         'source'        => $agreement_kode,
                //         'target'        => $kontraktor_kode,
                //         'currency'      => $currency,
                //         'rate'          => 1,
                //         'coa'           => $K_COA['coa_accrued'],
                //         'value'         => $list[$i]['amount'],
                //         'kode'          => $kode,
                //         'tanggal'       => $tanggal_send,
                //         'keterangan'    => $list[$i]['keterangan'] . ' - ' . $list[$i]['remarks']
                //     ));
                // }
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
    //=> / END: Approve

    $return['status'] = 1;
}
else{
    $return = array(
        'pihakketiga_coa'   => 0,
        'error_msg'         => 'Please call accounting to fill default activity/account for this contractor.'
    );
}

echo Core::ReturnData($return);
?>