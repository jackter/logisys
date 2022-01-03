<?php
$Modid = 26;

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
    'def'       => 'initial_stock',
    'detail'    => 'initial_stock_detail',
    'sstock'    => 'storeloc_stock'
);

/**
 * Update Verify
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
	'table'			=> $Table['def'],
	'clause'		=> "WHERE id = '" . $id . "'",
	'action'		=> "approve",
	'description'	=> "Approve Request Set Initial Stock " . $kode
);
$History = Core::History($HistoryField);

$Field = array(
    'approved'      => 1,
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

    $Initial = $DB->Result($DB->Query(
        $Table['def'],
        array(
            'company',
            'storeloc',
            'storeloc_kode',
            'kode',
            'tanggal'
        ),
        "
            WHERE
                id = '" . $id . "'
        "
    ));

    /**
     * Send Detail to Storeloc
     */
    $Q_Detail = $DB->Query(
        $Table['detail'],
        array(
            'item',
            'qty',
            'price'
        ),
        "
            WHERE
                header = '" . $id . "'
        "
    );
    $R_Detail = $DB->Row($Q_Detail);
    if($R_Detail > 0){
        $i = 0;
        while($Detail = $DB->Result($Q_Detail)){

            /**
             * Insert to Jurnal and Update Stock
             */
            $Jurnal = App::JurnalStock(array(
                'tipe'          => 'debit',
                'company'       => $Initial['company'],
                'storeloc'      => $Initial['storeloc'],
                'item'          => $Detail['item'],
                'qty'           => $Detail['qty'],
                'price'         => $Detail['price'],
                'keterangan'    => 'INITIAL STOCK',
                'kode'          => $Initial['kode'],
                'tanggal'       => $Initial['tanggal']
            ));
            //=> / END : Insert to Jurnal and Update Stock

            /**
             * Insert to Jurnal Accounting
             */

            if($enable_journal == 1){
                /**
                * Select Item COA
                */
                $COA_OpeningBalance = $DB->Result($DB->Query(
                    "trx_coa_balance",
                    array(
                        'coa'    
                    ),
                    "
                    WHERE
                        doc_nama = 'Initial Stock' and seq = 1 AND company = ".$Initial['company']."
                    "
                ));

                $Q_COA_Item = $DB->Query(
                    "item_coa",
                    array(
                        'id', 
                        'item_type',
                        'coa_persediaan', 
                        'coa_penjualan', 
                        'coa_disc_penjualan', 
                        'coa_retur_penjualan', 
                        'coa_retur_pembelian', 
                        'coa_hpp', 
                        'coa_accrued', 
                        'coa_beban'       
                    ),
                    "
                    WHERE 
                        item_id = '" . $Detail['item'] . "'
                        AND company = ".$Initial['company']."
                    "
                );
                $R_COA_Item = $DB->Row($Q_COA_Item);
                if($R_COA_Item > 0){
                    $COA_Item = $DB->Result($Q_COA_Item);

                    if($COA_Item['coa_persediaan']){
                        $JurnalAccounting = App::JurnalPosting(array(
                            'trx_type'      => 12,
                            'tipe'          => 'debit',
                            'company'       => $Initial['company'],
                            'source'        => $Initial['kode'],
                            'target'        => $Initial['storeloc_kode'],
                            'target_2'      => $Detail['item'],
                            'currency'      => 'IDR',
                            'rate'          => 1,
                            'coa'           => $COA_Item['coa_persediaan'],
                            'value'         => $Detail['price'] * $Detail['qty'],
                            'kode'          => $Initial['kode'],
                            'tanggal'       => $Initial['tanggal']
                        ));

                        $JurnalAccounting = App::JurnalPosting(array(
                            'trx_type'      => 12,
                            'tipe'          => 'credit',
                            'company'       => $Initial['company'],
                            'source'        => $Initial['kode'],
                            'target'        => $Initial['storeloc_kode'],
                            'target_2'      => $Detail['item'],
                            'currency'      => 'IDR',
                            'rate'          => 1,
                            'coa'           => $COA_OpeningBalance['coa'],
                            'value'         => $Detail['price'] * $Detail['qty'],
                            'kode'          => $Initial['kode'],
                            'tanggal'       => $Initial['tanggal']
                        ));
                    }
                }
                //=> / END : Select Item COA
                //=> / END : Insert to Jurnal Accounting

                $return['detail'][$i]['jurnal'] = $Jurnal['msg'];
            }

            $i++;

        }
    }
    //=> / END : Send Detail to Storeloc

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