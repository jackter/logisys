<?php

$Modid = 117;

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

$Table = array(
    'def'       => 'bp',
    'detail'    => 'bp_detail',
    'reff_a'    => 'invoice',
    'reff_b'    => 'sp3',
    'exchange'      => 'exchange',
    'param'         => 'parameter'
);

$Detail = json_decode($detail, true);

/**
 * Update Journal
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
	'table'			=> $Table['def'],
	'clause'		=> "WHERE id = '" . $id . "'",
	'action'		=> "approve",
	'description'	=> "Approve Bank Payment " . $kode
);
$History = Core::History($HistoryField);

$Field = array(
    'approved'      => 1,
    'approved_by'   => Core::GetState('id'),
	'approved_date'	=> $Date,
    'update_by'		=> Core::GetState('id'),
	'update_date'	=> $Date,
	'history'		=> $History
);

$DB->ManualCommit();

if($DB->Update(
    $Table['def'],
    $Field,
    "id = '" . $id . "'"
)){
    $DB->QueryPort("
        DELETE FROM journal
        WHERE ref_kode = '" . $kode . "'
    ");
    
    /**
     * Get Data
     */
    for($i = 0; $i < sizeof($Detail); $i++){
        if($Detail[$i]['coa'] != 0){            
            if($reff_type == 5){
                if($Detail[$i]['reff_id'] != 0){
                    $DB->QueryPort("
                        UPDATE " . $Table['reff_b'] . " SET is_payment = 1 WHERE id = " . $Detail[$i]['reff_id'] . "
                    ");
                }

                $Reff = $Detail[$i]['reff'];
                $ReffData = $Detail[$i]['reff_data'];

                if($Reff['tipe'] == 1){

                    if(sizeof($ReffData) > 0){

                        foreach($ReffData AS $Index => $Data){

                            $DB->Delete(
                                "journal",
                                "ref_kode = '" . $Data['dp_inv_kode'] . "'"
                            );

                            $amount_uang_muka = 0;
                            $amount_ppn = 0;
                            $amount_pph = 0;

                            $rate = 1;

                            /**
                             * Find Currency
                             */
                            if($Data['currency'] != "IDR"){
                                $R_Exchange_Ext = $DB->Row($DB->Query(
                                    $Table['param'],
                                    array(
                                        'param_val'
                                    ),
                                    "
                                        WHERE    
                                            id = 'exchange_execution'
                                            AND '" . $tanggal_send . "' <= param_val
                                    "
                                ));
                        
                                if($R_Exchange_Ext > 0){
                                    $exchange = $DB->Result($DB->Query(
                                        $Table['exchange'],
                                        array(
                                            'rate'
                                        ),
                                        "
                                            WHERE    
                                                tanggal <= '" . $tanggal_send . "' 
                                                AND cur_kode = '" . $Data['currency'] . "'
                                            ORDER BY tanggal desc 
                                            LIMIT 1
                                        "
                                    ));
                        
                                    $rate = $exchange['rate'];
                                }
                            }
                            //=> / END : Find CUrrency

                            /**
                             * Jurnal Uang Muka
                             */
                            if ($Data['coa_uang_muka'] > 0) {
                                $tot_oc = $Data['other_cost'] / $Data['tot_qty_po'] * $Data['qty_po'];
                                $tot_ppbkb = $Data['ppbkb'] / $Data['tot_qty_po'] * $Data['qty_po'];
                                $price = $Data['price'];
                                if ($Data['inclusive_ppn']) {
                                    $price = $Data['price'] / 1.1;
                                }

                                $amount_uang_muka = (($tot_oc + $tot_ppbkb) + ((100 - $Data['disc']) / 100 * ($price * $Data['qty_po']))) / 100 * $Data['dp_pct'];

                                if ($amount_uang_muka != 0) {
                                    $Jurnal = App::JurnalPosting(array(
                                        'trx_type'      => 5,
                                        'tipe'          => 'debit',
                                        'company'       => $Data['company'],
                                        'source'        => $Data['dp_inv_kode'],
                                        'target'        => $Data['po_kode'],
                                        'target_2'      => $Data['item'],
                                        'currency'      => $Data['currency'],
                                        'rate'          => $rate,
                                        'coa'           => $Data['coa_uang_muka'],
                                        'value'         => $amount_uang_muka,
                                        'kode'          => $Data['dp_inv_kode'],
                                        'tanggal'       => $tanggal_send
                                    ));
                                    //=> / END : Insert to Jurnal Posting and Update Balance
                                }
                            }
                            //=> / END : Jurnal Uang Muka

                            /**
                             * Jurnal PPN
                             */
                            if ($Data['coa_ppn'] > 0) {
                                if ($Data['customs'] == 1) {
                                    $amount_ppn = 0;
                                } else {
                                    $price = $Data['price'];
                                    if ($Data['inclusive_ppn']) {
                                        $price = $Data['price'] / 1.1;
                                    }
                                    $amount_ppn = (((100 - $Data['disc']) / 100 * ($price * $Data['qty_po'])) * ($Data['ppn'] / 100)) / 100 * $Data['dp_pct'];
                                }

                                if ($amount_ppn > 0) {
                                    $Jurnal = App::JurnalPosting(array(
                                        'trx_type'      => 5,
                                        'tipe'          => $Data['coa_pembukuan_ppn'],
                                        'company'       => $Data['company'],
                                        'source'        => $Data['dp_inv_kode'],
                                        'target'        => $Data['po_kode'],
                                        'target_2'      => $Data['item'],
                                        'currency'      => $Data['currency'],
                                        'rate'          => $rate,
                                        'coa'           => $Data['coa_ppn'],
                                        'value'         => $amount_ppn,
                                        'kode'          => $Data['dp_inv_kode'],
                                        'tanggal'       => $tanggal_send
                                    ));
                                }
                                //=> / END : Insert to Jurnal Posting and Update Balance
                            }
                            //=> / END: Jurnal PPN

                            /**
                             * Jurnal PPH
                             */
                            if ($Data['amount_pph'] != 0 && $Data['coa_pph'] > 0) {
                                $return['pembukuan_pph'] = $Data['coa_pembukuan_pph'];
                                if ($Data['coa_pembukuan_pph'] == 'debit') {
                                    $amount_pph = -1 * $Data['amount_pph'];
                                } else {
                                    $amount_pph = $Data['amount_pph'];
                                }
                                $Jurnal = App::JurnalPosting(array(
                                    'trx_type'      => 5,
                                    'tipe'          => $Data['coa_pembukuan_pph'],
                                    'company'       => $Data['company'],
                                    'source'        => $Data['dp_inv_kode'],
                                    'target'        => $Data['po_kode'],
                                    'target_2'      => $Data['item'],
                                    'currency'      => $Data['currency'],
                                    'rate'          => $rate,
                                    'coa'           => $Data['coa_pph'],
                                    'value'         => $amount_pph,
                                    'kode'          => $Data['dp_inv_kode'],
                                    'tanggal'       => $tanggal_send
                                ));
                                //=> / END : Insert to Jurnal Posting and Update Balance
                            }
                            //=> / END : Jurnal PPH

                            /**
                             * Jurnal Hutang Supplier
                             */
                            if ($Data['coa_hutang_supplier'] > 0) {
                                if ($amount_uang_muka + $amount_ppn - $Data['amount_pph'] != 0) {
                                    $Jurnal = App::JurnalPosting(array(
                                        'trx_type'      => 5,
                                        'tipe'          => 'credit',
                                        'company'       => $Data['company'],
                                        'source'        => $Data['dp_inv_kode'],
                                        'target'        => $Data['supplier_kode'],
                                        'target_2'      => $Data['item'],
                                        'currency'      => $Data['currency'],
                                        'rate'          => $rate,
                                        'coa'           => $Data['coa_hutang_supplier'],
                                        'value'         => $amount_uang_muka + $amount_ppn - $Data['amount_pph'],
                                        'kode'          => $Data['dp_inv_kode'],
                                        'tanggal'       => $tanggal_send
                                    ));
                                    //=> / END : Insert to Jurnal Posting and Update Balance
                                }
                            } else {
                                $DB->LogError("Please define default activity/account for this supplier " . $Data['supplier_nama']);
                                exit();
                            }
                            //=> / END : Jurnal Hutang Supplier

                        }

                    }

                }
                else if($Reff['tipe'] == 4 && $Reff['jurnal_post'] == 1){
                    
                    if(sizeof($ReffData) > 0){
                        $Data = $ReffData[0];
                
                        $rate = 1;
                
                        if($Data['currency'] != "IDR"){
                            $R_Exchange_Ext = $DB->Row($DB->Query(
                                $Table['param'],
                                array(
                                    'param_val'
                                ),
                                "
                                    WHERE    
                                        id = 'exchange_execution'
                                        AND '" . $Data['ref_tgl'] . "' <= param_val
                                "
                            ));
                
                            if($R_Exchange_Ext > 0){
                                $exchange = $DB->Result($DB->Query(
                                    $Table['exchange'],
                                    array(
                                        'rate'
                                    ),
                                    "
                                        WHERE    
                                            tanggal <= '" . $Data['ref_tgl'] . "' 
                                            AND cur_kode = '" . $Data['currency'] . "'
                                        ORDER BY tanggal desc 
                                        LIMIT 1
                                    "
                                ));
                
                                $rate = $exchange['rate'];
                
                                $DB->Delete(
                                    "invoice_exchange_history",
                                    "
                                        header = " . $Reff['id'] . "
                                        AND tanggal >= '" . $Data['ref_tgl'] . "'
                                    "
                                );
                
                                $DB->Insert(
                                    "invoice_exchange_history",
                                    array(
                                        'header'    => $Reff['id'],
                                        'tanggal'   => $Data['ref_tgl'],
                                        'rate'      => $rate
                                    )
                                );
                            }
                            else{
                                $DB->LogError("Exchange rate is not defined at " . $Data['ref_tgl'] . " for " . $Data['currency']);
                                exit();
                            }
                        }
                
                        $PihakKetiga = $DB->Result($DB->Query(
                            "pihakketiga_coa",
                            array(
                                'coa'
                            ),
                            "
                                WHERE company = " . $Data['company'] . "
                                and pihakketiga_tipe = " . $Data['tipe_pihak_ketiga'] . "
                                and pihakketiga = " . $Data['pihak_ketiga'] . "
                            "
                        ));
                
                        if(!$PihakKetiga){
                            $DB->LogError("Please define default activity/account for this third party, " . $Data['pihak_ketiga_nama']);
                            exit();
                        }
                
                        $Q_Detail = $DB->Query(
                            "invoice_expense",
                            array(
                                'coa',
                                'coa_kode' => 'kode',
                                'coa_nama' => 'nama',
                                'jumlah' => 'amount',
                                'keterangan' => 'notes'
                            ),
                            "
                                WHERE header = '" . $Reff['id'] . "'
                            "
                        );
                        $R_Detail = $DB->Row($Q_Detail);
                        if ($R_Detail > 0) {
                            $debit = 'debit';
                            $credit = 'credit';
                            if($Data['tipe_pihak_ketiga'] == 3){
                                $debit = 'credit';
                                $credit = 'debit';
                            }
                            while($DetailInv = $DB->Result($Q_Detail)){
                                if($DetailInv['coa'] > 0 && $DetailInv['amount'] != 0){
                                    if($Detail['amount'] < 0){
                                        $Jurnal = App::JurnalPosting(array(
                                            'trx_type'      => 24,
                                            'tipe'          => $credit,
                                            'company'       => $Data['company'],
                                            'source'        => $Data['kode'],
                                            'target'        => $Data['ref_kode'],
                                            'currency'      => $Data['currency'],
                                            'rate'          => $rate,
                                            'coa'           => $DetailInv['coa'],
                                            'value'         => $DetailInv['amount'] * -1,
                                            'kode'          => $Data['kode'],
                                            'tanggal'       => $tanggal_send,
                                            'keterangan'    => $DetailInv['notes']
                                        ));
                                    }
                                    else{
                                        $Jurnal = App::JurnalPosting(array(
                                            'trx_type'      => 24,
                                            'tipe'          => $debit,
                                            'company'       => $Data['company'],
                                            'source'        => $Data['kode'],
                                            'target'        => $Data['ref_kode'],
                                            'currency'      => $Data['currency'],
                                            'rate'          => $rate,
                                            'coa'           => $DetailInv['coa'],
                                            'value'         => $DetailInv['amount'],
                                            'kode'          => $Data['kode'],
                                            'tanggal'       => $tanggal_send,
                                            'keterangan'    => $DetailInv['notes']
                                        ));
                                    }
                                }
                            }
                
                            $Jurnal = App::JurnalPosting(array(
                                'trx_type'      => 24,
                                'tipe'          => $credit,
                                'company'       => $Data['company'],
                                'source'        => $Data['kode'],
                                'target'        => $Data['pihak_ketiga_kode'],
                                'currency'      => $Data['currency'],
                                'rate'          => $rate,
                                'coa'           => $PihakKetiga['coa'],
                                'value'         => $Data['amount'],
                                'kode'          => $Data['kode'],
                                'tanggal'       => $tanggal_send,
                                'keterangan'    => $Data['note']
                            ));
                        }

                    }
                    
                }
            }
        }
    }

    $rate = 1;
    $lastRate = $rate;

    if($currency != "IDR"){
        $R_Exchange_Ext = $DB->Row($DB->Query(
            $Table['param'],
            array(
                'param_val'
            ),
            "
                WHERE    
                    id = 'exchange_execution'
                    AND '" . $tanggal_send . "' <= param_val
            "
        ));

        if($R_Exchange_Ext > 0){
            $exchange = $DB->Result($DB->Query(
                $Table['exchange'],
                array(
                    'rate'
                ),
                "
                    WHERE    
                        tanggal <= '" . $tanggal_send . "' 
                        AND cur_kode = '" . $currency . "'
                    ORDER BY tanggal desc 
                    LIMIT 1
                "
            ));

            $rate = $exchange['rate'];
            $lastRate = $rate;

            if($trx_rate <= 1){
                $trx_rate = $rate;
            }

            for($i = 0; $i < sizeof($Detail); $i++){
                if($Detail[$i]['coa'] != 0){
                    $trx_bal_kurs_unreal = $DB->Result($DB->Query(
                        "trx_coa_balance",
                        array(
                            'coa',
                            'coa_kode',
                            'coa_nama',
                            'seq'
                        ),
                        "
                            WHERE    
                                company = " . $company . "
                                AND doc_source = 'Bank'
                                AND doc_nama = 'Bank Payment'
                                AND seq = 70
                        "
                    ));

                    $trx_bal_kurs_real = $DB->Result($DB->Query(
                        "trx_coa_balance",
                        array(
                            'coa',
                            'coa_kode',
                            'coa_nama',
                            'seq'
                        ),
                        "
                            WHERE    
                                company = " . $company . "
                                AND doc_source = 'Bank'
                                AND doc_nama = 'Bank Payment'
                                AND seq = 80
                        "
                    ));

                    $Reff = $DB->Result($DB->Query(
                        $Table['reff_a'],
                        array(
                            'id',
                            'tipe',
                            'is_payment',
                            'jurnal_post'
                        ),
                        "
                            WHERE
                                sp3 = '" . $Detail[$i]['reff_id'] . "'
                        "
                    ));
    
                    if($Reff['id']){
                        $DB->Delete(
                            "invoice_exchange_history",
                            "
                                header = '" . $Reff['id'] . "'
                                AND tanggal > '" . $tanggal_send . "'
                            "
                        );
    
                        $CurRate = $DB->Result($DB->Query(
                            "invoice_exchange_history",
                            array(
                                'rate'
                            ),
                            "
                                WHERE 
                                    header = '" . $Reff['id'] . "'
                                ORDER BY tanggal DESC
                                LIMIT 1
                            "
                        ));
    
                        if($CurRate){
                            $rate = $CurRate['rate'];
                            $trx_rate = $rate;
                        }

                        if($Detail[$i]['total'] >= 0){
                            $tipe_debitcredit = 'debit';
                        }
                        else{
                            $tipe_debitcredit = 'credit';
                        }
    
                        $Jurnal = App::JurnalPosting(array(
                            'trx_type'      => 13,
                            'tipe'          => $tipe_debitcredit,
                            'company'       => $company,
                            'source'        => $kode,
                            'target'        => $Detail[$i]['reff_kode'],
                            'currency'      => $currency,
                            'rate'          => $trx_rate,
                            'coa'           => $Detail[$i]['coa'],
                            'value'         => abs($Detail[$i]['total']),
                            'kode'          => $kode,
                            'tanggal'       => $tanggal_send,
                            'keterangan'    => $Detail[$i]['uraian']
                        ));

                        if($trx_bal_kurs_real && !$CurRate){
                            if((float)$trx_rate < (float)$lastRate){
                                $Jurnal = App::JurnalPosting(array(
                                    'trx_type'      => 13,
                                    'tipe'          => 'debit',
                                    'company'       => $company,
                                    'source'        => $kode,
                                    'target'        => 'Cost Book',
                                    'currency'      => 'IDR',
                                    'rate'          => 1,
                                    'coa'           => $trx_bal_kurs_real['coa'],
                                    'value'         => ($lastRate * $Detail[$i]['total']) - ($trx_rate * $Detail[$i]['total']),
                                    'kode'          => $kode,
                                    'tanggal'       => $tanggal_send,
                                    'keterangan'    => "Selisih Kurs " . $currency
                                ));
                            }
                            else if((float)$trx_rate > (float)$lastRate){
                                $Jurnal = App::JurnalPosting(array(
                                    'trx_type'      => 13,
                                    'tipe'          => 'credit',
                                    'company'       => $company,
                                    'source'        => $kode,
                                    'target'        => 'Cost Book',
                                    'currency'      => 'IDR',
                                    'rate'          => 1,
                                    'coa'           => $trx_bal_kurs_real['coa'],
                                    'value'         => ($trx_rate * $Detail[$i]['total']) - ($lastRate * $Detail[$i]['total']),
                                    'kode'          => $kode,
                                    'tanggal'       => $tanggal_send,
                                    'keterangan'    => "Selisih Kurs " . $currency
                                ));
                            }
                        }
                
                        if($trx_bal_kurs_unreal && $CurRate){
                            if((float)$rate < (float)$lastRate){
                                $Jurnal = App::JurnalPosting(array(
                                    'trx_type'      => 13,
                                    'tipe'          => 'debit',
                                    'company'       => $company,
                                    'source'        => $kode,
                                    'target'        => 'Cost Book',
                                    'currency'      => 'IDR',
                                    'rate'          => 1,
                                    'coa'           => $trx_bal_kurs_unreal['coa'],
                                    'value'         => ($lastRate * $Detail[$i]['total']) - ($rate * $Detail[$i]['total']),
                                    'kode'          => $kode,
                                    'tanggal'       => $tanggal_send,
                                    'keterangan'    => "Selisih Kurs invoice no." . $Detail[$i]['reff_kode']
                                ));
                            }
                            else if((float)$rate > (float)$lastRate){
                                $Jurnal = App::JurnalPosting(array(
                                    'trx_type'      => 13,
                                    'tipe'          => 'credit',
                                    'company'       => $company,
                                    'source'        => $kode,
                                    'target'        => 'Cost Book',
                                    'currency'      => 'IDR',
                                    'rate'          => 1,
                                    'coa'           => $trx_bal_kurs_unreal['coa'],
                                    'value'         => ($rate * $Detail[$i]['total']) - ($lastRate * $Detail[$i]['total']),
                                    'kode'          => $kode,
                                    'tanggal'       => $tanggal_send,
                                    'keterangan'    => "Selisih Kurs invoice no." . $Detail[$i]['reff_kode']
                                ));
                            }
                        }
                    }
                }
            }
        
            $Jurnal = App::JurnalPosting(array(
                'trx_type'      => 13,
                'tipe'          => 'credit',
                'company'       => $company,
                'source'        => $bank_kode,
                'target'        => $kode,
                'currency'      => $currency,
                'rate'          => $lastRate,
                'coa'           => $bank_coa,
                'value'         => $total,
                'kode'          => $kode,
                'tanggal'       => $tanggal_send,
                'keterangan'    => $remarks
            ));
        }
        else{
            $DB->LogError("Exchange rate is not defined at " . $tanggal_send . " for " . $currency);
            exit();
        }
    }
    else{
        for($i = 0; $i < sizeof($Detail); $i++){
            if($Detail[$i]['coa'] != 0){
                if($Detail[$i]['total'] >= 0){
                    $tipe_debitcredit = 'debit';
                }
                else{
                    $tipe_debitcredit = 'credit';
                }

                $Jurnal = App::JurnalPosting(array(
                    'trx_type'      => 13,
                    'tipe'          => $tipe_debitcredit,
                    'company'       => $company,
                    'source'        => $kode,
                    'target'        => $Detail[$i]['reff_kode'],
                    'currency'      => 'IDR',
                    'rate'          => 1,
                    'coa'           => $Detail[$i]['coa'],
                    'value'         => abs($Detail[$i]['total']),
                    'kode'          => $kode,
                    'tanggal'       => $tanggal_send,
                    'keterangan'    => $Detail[$i]['uraian']
                ));
        
                //=> / END : Insert to Jurnal Posting and Update Balance                
                $return['jurnalPosting'][$i] = $Jurnal['msg'];
            }
        }
    
        $Jurnal = App::JurnalPosting(array(
            'trx_type'      => 13,
            'tipe'          => 'credit',
            'company'       => $company,
            'source'        => $bank_kode,
            'target'        => $kode,
            'currency'      => 'IDR',
            'rate'          => 1,
            'coa'           => $bank_coa,
            'value'         => $total,
            'kode'          => $kode,
            'tanggal'       => $tanggal_send,
            'keterangan'    => $remarks
        ));
    
        //=> / END : Insert to Jurnal Posting and Update Balance
        
        $return['jurnalPosting'][$i] = $Jurnal['msg'];
    }

    $DB->Commit();
    $return['status'] = 1;
}else{
    $return = array(
        'status'    => 0,
        'error_msg' => $GLOBALS['mysql']->error
    );
}
//=> / END: Update Verify

echo Core::ReturnData($return);
?>