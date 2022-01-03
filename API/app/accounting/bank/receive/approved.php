<?php

$Modid = 118;

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
    'def'       => 'br',
    'detail'    => 'br_detail',
    'reff'      => 'sales_invoice',
    'tax'           => 'taxmaster',
    'trx_bal'       => 'trx_coa_balance',
    'pihak_ketiga'  => 'pihakketiga_coa',
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
	'action'		=> "journal",
	'description'	=> "Approve Bank Receive " . $kode
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

$return['detail'] = $Detail;

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
        if(!empty($Detail[$i]['id'])){
            if($reff_type == 1){
                $Reff = $DB->Result($DB->Query(
                    $Table['reff'],
                    array(
                        'is_payment',
                        'tipe'
                    ),
                    "
                        WHERE
                            id = '" . $Detail[$i]['reff_id'] . "'
                    "
                ));

                $DB->QueryPort("
                    UPDATE " . $Table['reff'] . " SET is_payment = 1 WHERE id = " . $Detail[$i]['reff_id'] . "
                ");

                if($Reff['is_payment'] == 0 && $Reff['tipe'] == 1){
                    $Q_Data = $DB->QueryPort("
                        SELECT
                            I.id,
                            I.sc,
                            I.sc_kode,
                            I.company,
                            I.company_abbr,
                            I.company_nama,
                            I.cust,
                            I.cust_kode,
                            I.cust_nama,
                            I.cust_abbr,
                            I.inv_tgl,
                            I.kode,
                            I.currency,
                            K.dp,
                            K.ppn,
                            K.inclusive_ppn,
                            K.sold_price,
                            K.grand_total,
                            K.qty,
                            K.item,
                            K.item_kode,
                            K.item_nama,
                            K.item_satuan
                        FROM
                            sales_invoice AS I,
                            kontrak AS K 
                        WHERE
                            I.id = '" . $Detail[$i]['reff_id'] . "' 
                            AND I.sc = K.id
                    ");
                    $R_Data = $DB->Row($Q_Data);

                    if ($R_Data > 0) {

                        $Data = $DB->Result($Q_Data);
                        if($Data['ppn']){
                            $tax = $DB->Result($DB->Query(
                                $Table['tax'],
                                array(
                                    'pembukuan',
                                    'coa',
                                    'coa_kode',
                                    'coa_nama'
                                ),
                                "
                                    WHERE    
                                        company = " . $Data['company'] . "
                                        AND code = 'VAT-OUT'
                                "
                            ));
                        }

                        $trx_bal = $DB->Result($DB->Query(
                            $Table['trx_bal'],
                            array(
                                'coa',
                                'coa_kode',
                                'coa_nama',
                                'seq'
                            ),
                            "
                                WHERE    
                                    company = " . $Data['company'] . "
                                    AND doc_source = 'Finance & Accounting'
                                    AND doc_nama = 'Sales Inv. DP'
                                    AND seq = 1
                                    AND status = 1
                            "
                        ));

                        $pihak_ketiga = $DB->Result($DB->Query(
                            $Table['pihak_ketiga'],
                            array(
                                'coa',
                                'coa_accrued',
                            ),
                            "
                                WHERE    
                                    company = " . $Data['company'] . "
                                    AND pihakketiga_tipe = 3
                                    AND pihakketiga = " . $Data['cust'] . "
                            "
                        ));

                        $accrued = 0;
                        $ppn_amount = 0;
                        $gt = 0;

                        if($Data['ppn'] == 10 && $Data['inclusive_ppn'] == 1){
                            $accrued = (($Data['sold_price'] * $Data['qty']) / 1.1);
                            $ppn_amount = ($Data['sold_price'] * $Data['qty']) - (($Data['sold_price'] * $Data['qty']) / 1.1);
                            $gt = $accrued + $ppn_amount;
                        }
                        else if($Data['ppn'] == 10 && $Data['inclusive_ppn'] == 0){
                            $accrued = $Data['sold_price'] * $Data['qty'];
                            $ppn_amount = ($Data['sold_price'] * $Data['qty']) / 100 * 10;
                            $gt = $accrued + $ppn_amount;
                        }
                        else{
                            $accrued = $Data['sold_price'] * $Data['qty'];
                            $gt = $accrued;
                        }

                        $accrued = $accrued / 100 * $Data['dp'];
                        $ppn_amount = $ppn_amount / 100 * $Data['dp'];
                        $gt = $gt / 100 * $Data['dp'];
                        
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
                                        AND '" . $tanggal . "' <= param_val
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
                                            tanggal <= '" . $tanggal . "' 
                                            AND cur_kode = '" . $Data['currency'] . "'
                                        ORDER BY tanggal desc 
                                        LIMIT 1
                                    "
                                ));

                                $rate = $exchange['rate'];
                            }
                            else{
                                $DB->LogError("Exchange rate is not defined at " . $tanggal . " for " . $Data['currency']);
                                exit();
                            }
                        }
                        
                        if($trx_bal['coa'] && $pihak_ketiga['coa']){
                            if($pihak_ketiga['coa'] && $gt > 0){
                                $Jurnal = App::JurnalPosting(array(
                                    'trx_type'      => 18,
                                    'tipe'          => 'debit',
                                    'company'       => $Data['company'],
                                    'source'        => $Data['kode'],
                                    'target'        => $Data['cust_kode'],
                                    'target_2'      => $Data['item'],
                                    'currency'      => $Data['currency'],
                                    'rate'          => $rate,
                                    'coa'           => $pihak_ketiga['coa'],
                                    'value'         => $gt,
                                    'kode'          => $Data['kode'],
                                    'tanggal'       => $tanggal,
                                    'keterangan'    => "Inv Down Payment Contract No " . $Data['sc_kode'] . " a/n " . $Data['cust_nama']
                                ));
                            }

                            if($Data['ppn'] == 10 && $ppn_amount > 0){
                                $Jurnal = App::JurnalPosting(array(
                                    'trx_type'      => 18,
                                    'tipe'          => 'credit',
                                    'company'       => $Data['company'],
                                    'source'        => $Data['kode'],
                                    'target'        => 'Cost Book',
                                    'target_2'      => $Data['item'],
                                    'currency'      => $Data['currency'],
                                    'rate'          => $rate,
                                    'coa'           => $tax['coa'],
                                    'value'         => $ppn_amount,
                                    'kode'          => $Data['kode'],
                                    'tanggal'       => $tanggal,
                                    'keterangan'    => "VAT Out Contract No " . $Data['sc_kode']
                                ));
                            }

                            if($accrued > 0){
                                $Jurnal = App::JurnalPosting(array(
                                    'trx_type'      => 18,
                                    'tipe'          => 'credit',
                                    'company'       => $Data['company'],
                                    'source'        => $Data['kode'],
                                    'target'        => $Data['cust_kode'],
                                    'target_2'      => $Data['item'],
                                    'currency'      => $Data['currency'],
                                    'rate'          => $rate,
                                    'coa'           => $trx_bal['coa'],
                                    'value'         => $accrued,
                                    'kode'          => $Data['kode'],
                                    'tanggal'       => $tanggal,
                                    'keterangan'    => "Inv Down Payment Contract No " . $Data['sc_kode']
                                ));
                            }
                        }
                        else{
                            $DB->LogError("Account customer is not defined");
                            exit();
                        }
                    }   
                }
            }
        }
    }

    $rate = 1;

    if($currency != "IDR"){
        $R_Exchange_Ext = $DB->Row($DB->Query(
            $Table['param'],
            array(
                'param_val'
            ),
            "
                WHERE    
                    id = 'exchange_execution'
                    AND '" . $tanggal . "' <= param_val
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
                        tanggal <= '" . $tanggal . "' 
                        AND cur_kode = '" . $currency . "'
                    ORDER BY tanggal desc 
                    LIMIT 1
                "
            ));

            $rate = $exchange['rate'];

            $Jurnal = App::JurnalPosting(array(
                'trx_type'      => 14,
                'tipe'          => 'debit',
                'company'       => $company,
                'source'        => $bank_kode,
                'target'        => $kode,
                'currency'      => $currency,
                'rate'          => $rate,
                'coa'           => $bank_coa,
                'value'         => $total,
                'kode'          => $kode,
                'tanggal'       => $tanggal,
                'keterangan'    => $remarks
            ));

            $costbook_all = true;
            for($i = 0; $i < sizeof($Detail); $i++){
                if($Detail[$i]['reff_id'] != 0){
                    $costbook_all = false;
                }
            }

            $lastRate = $rate;
            if($trx_rate <= 1){
                $trx_rate = $rate;
            }        
            for($i = 0; $i < sizeof($Detail); $i++){
                if(!empty($Detail[$i]['id'])){
                    if($Data['currency'] != 'IDR'){
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
                                    AND doc_nama = 'Bank Receive'
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
                                    AND doc_nama = 'Bank Receive'
                                    AND seq = 80
                            "
                        ));

                        $CurRate = $DB->Result($DB->Query(
                            "sales_invoice_exchange_history",
                            array(
                                'rate'
                            ),
                            "
                                WHERE 
                                    header = '" . $Detail[$i]['reff_id'] . "'
                                ORDER BY tanggal DESC
                                LIMIT 1
                            "
                        ));

                        if($CurRate){
                            $rate_inv = $CurRate['rate'];
                            $trx_rate = $rate_inv;
                        }
                    }

                    if($Detail[$i]['total'] >= 0){
                        $tipe_debitcredit = 'credit';
                    }
                    else{
                        $tipe_debitcredit = 'debit';
                    }

                    if($Detail[$i]['reff_id'] == 0 && !$costbook_all){
                        $trx_rate = $rate;
                    }

                    $Jurnal = App::JurnalPosting(array(
                        'trx_type'      => 14,
                        'tipe'          => $tipe_debitcredit,
                        'company'       => $company,
                        'source'        => $bank_kode,
                        'target'        => $Detail[$i]['reff_kode'],
                        'currency'      => $currency,
                        'rate'          => $trx_rate,
                        'coa'           => $Detail[$i]['coa'],
                        'value'         => abs($Detail[$i]['total']),
                        'kode'          => $kode,
                        'tanggal'       => $tanggal,
                        'keterangan'    => $Detail[$i]['uraian']
                    ));

                    if($trx_bal_kurs_real && !$CurRate){
                        if((float)$trx_rate > (float)$lastRate){
                            $Jurnal = App::JurnalPosting(array(
                                'trx_type'      => 14,
                                'tipe'          => 'debit',
                                'company'       => $company,
                                'source'        => $kode,
                                'target'        => 'Cost Book',
                                'currency'      => 'IDR',
                                'rate'          => 1,
                                'coa'           => $trx_bal_kurs_real['coa'],
                                'value'         => ($trx_rate * $Detail[$i]['total']) - ($lastRate * $Detail[$i]['total']),
                                'kode'          => $kode,
                                'tanggal'       => $tanggal,
                                'keterangan'    => "Selisih Kurs " . $currency
                            ));
                        }
                        else if((float)$trx_rate < (float)$lastRate){
                            $Jurnal = App::JurnalPosting(array(
                                'trx_type'      => 14,
                                'tipe'          => 'credit',
                                'company'       => $company,
                                'source'        => $kode,
                                'target'        => 'Cost Book',
                                'currency'      => 'IDR',
                                'rate'          => 1,
                                'coa'           => $trx_bal_kurs_real['coa'],
                                'value'         => ($lastRate * $Detail[$i]['total']) - ($trx_rate * $Detail[$i]['total']),
                                'kode'          => $kode,
                                'tanggal'       => $tanggal,
                                'keterangan'    => "Selisih Kurs " . $currency
                            ));
                        }
                    }

                    if($trx_bal_kurs_unreal && $CurRate){
                        if((float)$rate_inv > (float)$lastRate){
                            $Jurnal = App::JurnalPosting(array(
                                'trx_type'      => 14,
                                'tipe'          => 'debit',
                                'company'       => $company,
                                'source'        => $kode,
                                'target'        => 'Cost Book',
                                'currency'      => 'IDR',
                                'rate'          => 1,
                                'coa'           => $trx_bal_kurs_unreal['coa'],
                                'value'         => ($rate_inv * $Detail[$i]['total']) - ($lastRate * $Detail[$i]['total']),
                                'kode'          => $kode,
                                'tanggal'       => $tanggal,
                                'keterangan'    => "Selisih Kurs invoice no." . $Detail[$i]['reff_kode']
                            ));
                        }
                        else if((float)$rate_inv < (float)$lastRate){
                            $Jurnal = App::JurnalPosting(array(
                                'trx_type'      => 14,
                                'tipe'          => 'credit',
                                'company'       => $company,
                                'source'        => $kode,
                                'target'        => 'Cost Book',
                                'currency'      => 'IDR',
                                'rate'          => 1,
                                'coa'           => $trx_bal_kurs_unreal['coa'],
                                'value'         => ($lastRate * $Detail[$i]['total']) - ($rate_inv * $Detail[$i]['total']),
                                'kode'          => $kode,
                                'tanggal'       => $tanggal,
                                'keterangan'    => "Selisih Kurs invoice no." . $Detail[$i]['reff_kode']
                            ));
                        }
                    }
                }
            }
        }
        else{
            $DB->LogError("Exchange rate is not defined at " . $tanggal . " for " . $currency);
            exit();
        }
    }
    else{
        $Jurnal = App::JurnalPosting(array(
            'trx_type'      => 14,
            'tipe'          => 'debit',
            'company'       => $company,
            'source'        => $bank_kode,
            'target'        => $kode,
            'currency'      => 'IDR',
            'rate'          => 1,
            'coa'           => $bank_coa,
            'value'         => $total,
            'kode'          => $kode,
            'tanggal'       => $tanggal,
            'keterangan'    => $remarks
        ));
    
        for($i = 0; $i < sizeof($Detail); $i++){
            if($Detail[$i]['coa'] != 0){
                if($Detail[$i]['total'] >= 0){
                    $tipe_debitcredit = 'credit';
                }
                else{
                    $tipe_debitcredit = 'debit';
                }

                $Jurnal = App::JurnalPosting(array(
                    'trx_type'      => 14,
                    'tipe'          => $tipe_debitcredit,
                    'company'       => $company,
                    'source'        => $bank_kode,
                    'target'        => $Detail[$i]['reff_kode'],
                    'currency'      => 'IDR',
                    'rate'          => 1,
                    'coa'           => $Detail[$i]['coa'],
                    'value'         => abs($Detail[$i]['total']),
                    'kode'          => $kode,
                    'tanggal'       => $tanggal,
                    'keterangan'    => $Detail[$i]['uraian']
                ));
            }
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
//=> / END: Update Verify

echo Core::ReturnData($return);
?>