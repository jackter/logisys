<?php
$Modid = 208;

Perm::Check($Modid, 'verify');

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

$Table = array(
    'def'           => 'sales_invoice'
);

/**
 * Update Verify
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
    'table'         => $Table['def'],
    'clause'        => "WHERE id = '" . $id . "'",
    'action'        => "verify",
    'description'   => "Verify Sales Invoice Misc " . $kode
);
$History = Core::History($HistoryField);

$Field = array(
    'verified'      => 1,
    'verified_by'   => Core::GetState('id'),
    'verified_date' => $Date,
    'update_by'     => Core::GetState('id'),
    'update_date'   => $Date,
    'history'       => $History
);

$DB->ManualCommit();

if ($DB->Update(
    $Table['def'],
    $Field,
    "id = '" . $id . "'"
)) {

    $DB->QueryPort("
        DELETE FROM journal
        WHERE ref_kode = '" . $kode . "'
    ");

    $Q_Data = $DB->Query(
        "sales_invoice",
        array(
            'id',
            'company',
            'company_abbr',
            'company_nama',
            'kode',
            'pc_kode',
            'cust',
            'cust_kode',
            'cust_nama',
            'inv_tgl',
            'currency',
            'amount',
            'note'
        ),
        "
            WHERE id = '" . $id . "'
        "
    );
    $R_Data = $DB->Row($Q_Data);
    if ($R_Data > 0) {
        while($Data = $DB->Result($Q_Data)){
            $rate = 1;

            if($Data['currency'] != "IDR"){
                $R_Exchange_Ext = $DB->Row($DB->Query(
                    "parameter",
                    array(
                        'param_val'
                    ),
                    "
                        WHERE    
                            id = 'exchange_execution'
                            AND '" . $Data['inv_tgl'] . "' <= param_val
                    "
                ));
    
                if($R_Exchange_Ext > 0){
                    $exchange = $DB->Result($DB->Query(
                        "exchange",
                        array(
                            'rate'
                        ),
                        "
                            WHERE    
                                tanggal <= '" . $Data['inv_tgl'] . "' 
                                AND cur_kode = '" . $Data['currency'] . "'
                            ORDER BY tanggal desc 
                            LIMIT 1
                        "
                    ));
    
                    $rate = $exchange['rate'];
    
                    $DB->Delete(
                        "sales_invoice_exchange_history",
                        "
                            header = " . $Data['id'] . "
                            AND tanggal >= '" . $Data['inv_tgl'] . "'
                        "
                    );
    
                    $DB->Insert(
                        "sales_invoice_exchange_history",
                        array(
                            'header'    => $Data['id'],
                            'tanggal'   => $Data['inv_tgl'],
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
                    and pihakketiga_tipe = 3
                    and pihakketiga = " . $Data['cust'] . "
                "
            ));
    
            if(!$PihakKetiga){
                $DB->LogError("Please define default activity/account for this third party, " . $Data['pihak_ketiga_nama']);
                exit();
            }
    
            $Q_Detail = $DB->Query(
                "sales_invoice_expense",
                array(
                    'coa',
                    'coa_kode' => 'kode',
                    'coa_nama' => 'nama',
                    'jumlah' => 'amount',
                    'keterangan' => 'notes'
                ),
                "
                    WHERE header = '" . $Data['id'] . "'
                "
            );
            $R_Detail = $DB->Row($Q_Detail);
            if ($R_Detail > 0) {
                $debit = 'credit';
                $credit = 'debit';
                while($Detail = $DB->Result($Q_Detail)){
                    if($Detail['coa'] > 0 && $Detail['amount'] != 0){
                        if($Detail['amount'] < 0){
                            $Jurnal = App::JurnalPosting(array(
                                'trx_type'      => 27,
                                'tipe'          => $credit,
                                'company'       => $Data['company'],
                                'source'        => $Data['kode'],
                                'target'        => $Data['pc_kode'],
                                'pihak_ketiga'          => $Data['cust'],
                                'pihak_ketiga_kode'     => $Data['cust_kode'],
                                'pihak_ketiga_nama'     => $Data['cust_nama'],
                                'currency'      => $Data['currency'],
                                'rate'          => $rate,
                                'coa'           => $Detail['coa'],
                                'value'         => $Detail['amount'] * -1,
                                'kode'          => $Data['kode'],
                                'tanggal'       => $Data['inv_tgl'],
                                'keterangan'    => $Detail['notes']
                            ));
                        }
                        else{
                            $Jurnal = App::JurnalPosting(array(
                                'trx_type'      => 27,
                                'tipe'          => $debit,
                                'company'       => $Data['company'],
                                'source'        => $Data['kode'],
                                'target'        => $Data['pc_kode'],
                                'pihak_ketiga'          => $Data['cust'],
                                'pihak_ketiga_kode'     => $Data['cust_kode'],
                                'pihak_ketiga_nama'     => $Data['cust_nama'],
                                'currency'      => $Data['currency'],
                                'rate'          => $rate,
                                'coa'           => $Detail['coa'],
                                'value'         => $Detail['amount'],
                                'kode'          => $Data['kode'],
                                'tanggal'       => $Data['inv_tgl'],
                                'keterangan'    => $Detail['notes']
                            ));
                        }
                    }
                }
    
                $Jurnal = App::JurnalPosting(array(
                    'trx_type'      => 27,
                    'tipe'          => $credit,
                    'company'       => $Data['company'],
                    'source'        => $Data['kode'],
                    'target'        => $Data['pc_kode'],
                    'pihak_ketiga'          => $Data['cust'],
                    'pihak_ketiga_kode'     => $Data['cust_kode'],
                    'pihak_ketiga_nama'     => $Data['cust_nama'],
                    'currency'      => $Data['currency'],
                    'rate'          => $rate,
                    'coa'           => $PihakKetiga['coa'],
                    'value'         => $Data['amount'],
                    'kode'          => $Data['kode'],
                    'tanggal'       => $Data['inv_tgl'],
                    'keterangan'    => $Data['note']
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
//=> / END: Update Verify

echo Core::ReturnData($return);

?>