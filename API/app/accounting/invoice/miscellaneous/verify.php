<?php
$Modid = 202;
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
    'def'           => 'invoice',
    'detail'        => 'invoice_expense',
    'pihakketiga'   => 'pihakketiga_coa',
    'exchange'      => 'exchange',
    'param'         => 'parameter',
);

/**
 * Update Verify
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
    'table'         => $Table['def'],
    'clause'        => "WHERE id = '" . $id . "'",
    'action'        => "verify",
    'description'   => "Verify Invoice Miscellaneous " . $kode
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
        $Table['def'],
        array(
            'id',
            'company',
            'company_abbr',
            'company_nama',
            'kode',
            'tipe_pihak_ketiga',
            'pihak_ketiga',
            'pihak_ketiga_kode',
            'pihak_ketiga_nama',
            'ref_tgl',
            'ref_kode',
            'currency',
            'amount',
            'note'
        ),
        "
            WHERE id = '" . $id . "'
            AND jurnal_post = 0
        "
    );
    $R_Data = $DB->Row($Q_Data);
    if ($R_Data > 0) {
        $Data = $DB->Result($Q_Data);

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
                        header = " . $id . "
                        AND tanggal >= '" . $Data['ref_tgl'] . "'
                    "
                );

                $DB->Insert(
                    "invoice_exchange_history",
                    array(
                        'header'    => $id,
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
            $Table['pihakketiga'],
            array(
                'coa'
            ),
            "
                WHERE company = " . $Data['company'] . "
                and pihakketiga_tipe = " . ($Data['tipe_pihak_ketiga'] - 1) . "
                and pihakketiga = " . $Data['pihak_ketiga'] . "
            "
        ));

        if(!$PihakKetiga){
            $DB->LogError("Please define default activity/account for this third party, " . $Data['pihak_ketiga_nama']);
            exit();
        }

        $Q_Detail = $DB->Query(
            $Table['detail'],
            array(
                'coa',
                'coa_kode' => 'kode',
                'coa_nama' => 'nama',
                'jumlah' => 'amount',
                'keterangan' => 'notes'
            ),
            "
                WHERE header = '" . $id . "'
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
            while($Detail = $DB->Result($Q_Detail)){
                if($Detail['coa'] > 0 && $Detail['amount'] != 0){
                    if($Detail['amount'] < 0){
                        $Jurnal = App::JurnalPosting(array(
                            'trx_type'      => 24,
                            'tipe'          => $credit,
                            'company'       => $Data['company'],
                            'source'        => $Data['kode'],
                            'target'        => $Data['ref_kode'],
                            'currency'      => $Data['currency'],
                            'rate'          => $rate,
                            'coa'           => $Detail['coa'],
                            'value'         => $Detail['amount'] * -1,
                            'kode'          => $Data['kode'],
                            'tanggal'       => $Data['ref_tgl'],
                            'keterangan'    => $Detail['notes']
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
                            'coa'           => $Detail['coa'],
                            'value'         => $Detail['amount'],
                            'kode'          => $Data['kode'],
                            'tanggal'       => $Data['ref_tgl'],
                            'keterangan'    => $Detail['notes']
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
                'tanggal'       => $Data['ref_tgl'],
                'keterangan'    => $Data['note']
            ));
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