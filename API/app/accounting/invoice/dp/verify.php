<?php

$Modid = 46;
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
    'def'       => 'invoice',
    'po'        => 'po'
);

/**
 * Update Verify
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
    'table'         => $Table['def'],
    'clause'        => "WHERE id = '" . $id . "'",
    'action'        => "verify",
    'description'   => "Verify Invoice Down Payment " . $kode
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
    /**
     * Update PO
     */
    $HistoryFields = array(
        'table'         => $Table['po'],
        'clause'        => "WHERE id = '" . $id . "'",
        'action'        => "verify",
        'description'   => "Invoice Down Payment " . $kode
    );
    $HistoryPO = Core::History($HistoryFields);

    if ($enable_journal == 1) {

        if ($tipe == 1) {
            /**
             * Get Data
             */
            $Q_COA = $DB->Query(
                "pihakketiga_coa",
                array(
                    'id',
                    'coa',
                ),
                "WHERE 
                    pihakketiga_tipe = 0
                    AND company = '". $company ."'
                    AND pihakketiga = '". $supplier ."'
                    AND status = 1"
            );
            $R_COA = $DB->Row($Q_COA);

            if($R_COA > 0){
                $DB->Commit();
                $return['status'] = 1;
            }
            else{
                $DB->LogError("Please define default activity/account for this supplier");
                exit();
            }


            // $Q_Data = $DB->QueryPort("
            //     SELECT
            //         h.kode po_kode,
            //         i.kode dp_inv_kode,
            //         i.ref_tgl,
            //         h.supplier_kode,
            //         h.supplier_nama,
            //         d.item,
            //         h.currency,
            //         h.company,
            //         h.customs,
            //         h.disc,
            //         h.other_cost,
            //         h.ppbkb,
            //         ( SELECT sum( qty_po - qty_cancel ) FROM po_detail WHERE header = h.id ) tot_qty_po,
            //         h.inclusive_ppn,
            //         h.ppn,
            //         d.price,
            //         (d.qty_po - d.qty_cancel) AS qty_po,
            //         id.dp_pct,
            //     CASE
                        
            //             WHEN h.ppn > 0 THEN
            //             (
            //             SELECT
            //                 id 
            //             FROM
            //                 coa_master 
            //             WHERE
            //                 kode = ( SELECT coa_kode FROM taxmaster WHERE CODE = 'VAT-IN' AND company = h.company ) 
            //                 AND company = h.company 
            //             ) ELSE 0 
            //         END coa_ppn,
            //     CASE
                        
            //             WHEN h.ppn > 0 THEN
            //             ( SELECT pembukuan FROM taxmaster WHERE CODE = 'VAT-IN' AND company = h.company ) ELSE 0 
            //         END coa_pembukuan_ppn,
            //     CASE
                        
            //             WHEN d.pph > 0 THEN
            //             (
            //             SELECT
            //                 id 
            //             FROM
            //                 coa_master 
            //             WHERE
            //                 kode = ( SELECT coa_kode FROM taxmaster WHERE CODE = h.pph_code AND company = h.company ) 
            //                 AND company = h.company 
            //             ) ELSE 0 
            //         END coa_pph,
            //     CASE
                        
            //             WHEN d.pph > 0 THEN
            //             ( SELECT pembukuan FROM taxmaster WHERE CODE = h.pph_code AND company = h.company ) ELSE 0 
            //         END coa_pembukuan_pph,
            //     CASE
                        
            //             WHEN d.pph > 0 THEN
            //             (
            //                 (
            //                     (
            //                         ( 100- h.disc ) / 100 * ( ( CASE WHEN h.inclusive_ppn = 1 THEN d.price / 1.1 ELSE d.price END ) * d.qty_po ) 
            //                     ) 
            //                 ) * ( h.pph / 100 ) 
            //             ) / 100 * id.dp_pct ELSE 0 
            //         END amount_pph,
            //     CASE
                        
            //             WHEN h.currency = 'IDR' THEN
            //             ( SELECT coa FROM trx_coa_balance WHERE doc_nama = 'Down Payment Invoice' AND seq = 2 AND company = h.company ) 
            //         END coa_uang_muka,
            //     CASE
                        
            //             WHEN h.currency = 'IDR' THEN
            //             ( SELECT coa FROM trx_coa_balance WHERE doc_nama = 'Down Payment Invoice' AND seq = 1 AND company = h.company ) 
            //         END coa_hutang_supplier 
            //     FROM
            //         po h,
            //         po_detail d,
            //         invoice i,
            //         invoice_detail id 
            //     WHERE
            //         i.id = " . $id . " 
            //         AND h.id = d.header 
            //         AND i.tipe = 1 
            //         AND h.id = i.po 
            //         AND i.id = id.header");
            // $R_Data = $DB->Row($Q_Data);

            // if ($R_Data > 0) {
            //     $i = 0;
            //     while ($Data = $DB->Result($Q_Data)) {
            //         $amount_uang_muka = 0;
            //         $amount_ppn = 0;
            //         $amount_pph = 0;

            //         if ($Data['coa_uang_muka'] > 0) {
            //             $tot_oc = $Data['other_cost'] / $Data['tot_qty_po'] * $Data['qty_po'];
            //             $tot_ppbkb = $Data['ppbkb'] / $Data['tot_qty_po'] * $Data['qty_po'];
            //             $price = $Data['price'];
            //             if ($Data['inclusive_ppn']) {
            //                 $price = $Data['price'] / 1.1;
            //             }

            //             $amount_uang_muka = (($tot_oc + $tot_ppbkb) + ((100 - $Data['disc']) / 100 * ($price * $Data['qty_po']))) / 100 * $Data['dp_pct'];

            //             if ($amount_uang_muka != 0) {
            //                 $Jurnal = App::JurnalPosting(array(
            //                     'trx_type'      => 5,
            //                     'tipe'          => 'debit',
            //                     'company'       => $Data['company'],
            //                     'source'        => $Data['dp_inv_kode'],
            //                     'target'        => $Data['po_kode'],
            //                     'target_2'      => $Data['item'],
            //                     'currency'      => $Data['currency'],
            //                     'rate'          => 1,
            //                     'coa'           => $Data['coa_uang_muka'],
            //                     'value'         => $amount_uang_muka,
            //                     'kode'          => $Data['dp_inv_kode'],
            //                     'tanggal'       => $Data['ref_tgl']
            //                 ));
            //                 //=> / END : Insert to Jurnal Posting and Update Balance
            //             }
            //         }

            //         if ($Data['coa_ppn'] > 0) {
            //             if ($Data['customs'] == 1) {
            //                 $amount_ppn = 0;
            //             } else {
            //                 $price = $Data['price'];
            //                 if ($Data['inclusive_ppn']) {
            //                     $price = $Data['price'] / 1.1;
            //                 }
            //                 $amount_ppn = (((100 - $Data['disc']) / 100 * ($price * $Data['qty_po'])) * ($Data['ppn'] / 100)) / 100 * $Data['dp_pct'];
            //             }

            //             if ($amount_ppn > 0) {
            //                 $Jurnal = App::JurnalPosting(array(
            //                     'trx_type'      => 5,
            //                     'tipe'          => $Data['coa_pembukuan_ppn'],
            //                     'company'       => $Data['company'],
            //                     'source'        => $Data['dp_inv_kode'],
            //                     'target'        => $Data['po_kode'],
            //                     'target_2'      => $Data['item'],
            //                     'currency'      => $Data['currency'],
            //                     'rate'          => 1,
            //                     'coa'           => $Data['coa_ppn'],
            //                     'value'         => $amount_ppn,
            //                     'kode'          => $Data['dp_inv_kode'],
            //                     'tanggal'       => $Data['ref_tgl']
            //                 ));
            //             }
            //             //=> / END : Insert to Jurnal Posting and Update Balance
            //         }

            //         if ($Data['amount_pph'] != 0 && $Data['coa_pph'] > 0) {
            //             $return['pembukuan_pph'] = $Data['coa_pembukuan_pph'];
            //             if ($Data['coa_pembukuan_pph'] == 'debit') {
            //                 $amount_pph = -1 * $Data['amount_pph'];
            //             } else {
            //                 $amount_pph = $Data['amount_pph'];
            //             }
            //             $Jurnal = App::JurnalPosting(array(
            //                 'trx_type'      => 5,
            //                 'tipe'          => $Data['coa_pembukuan_pph'],
            //                 'company'       => $Data['company'],
            //                 'source'        => $Data['dp_inv_kode'],
            //                 'target'        => $Data['po_kode'],
            //                 'target_2'      => $Data['item'],
            //                 'currency'      => $Data['currency'],
            //                 'rate'          => 1,
            //                 'coa'           => $Data['coa_pph'],
            //                 'value'         => $amount_pph,
            //                 'kode'          => $Data['dp_inv_kode'],
            //                 'tanggal'       => $Data['ref_tgl']
            //             ));
            //             //=> / END : Insert to Jurnal Posting and Update Balance
            //         }

            //         if ($Data['coa_hutang_supplier'] > 0) {
            //             if ($amount_uang_muka + $amount_ppn - $Data['amount_pph'] != 0) {
            //                 $Jurnal = App::JurnalPosting(array(
            //                     'trx_type'      => 5,
            //                     'tipe'          => 'credit',
            //                     'company'       => $Data['company'],
            //                     'source'        => $Data['dp_inv_kode'],
            //                     'target'        => $Data['supplier_kode'],
            //                     'target_2'      => $Data['item'],
            //                     'currency'      => $Data['currency'],
            //                     'rate'          => 1,
            //                     'coa'           => $Data['coa_hutang_supplier'],
            //                     'value'         => $amount_uang_muka + $amount_ppn - $Data['amount_pph'],
            //                     'kode'          => $Data['dp_inv_kode'],
            //                     'tanggal'       => $Data['ref_tgl']
            //                 ));
            //                 //=> / END : Insert to Jurnal Posting and Update Balance
            //             }
            //         } else {
            //             $DB->LogError("Please define default activity/account for this supplier " . $Data['supplier_nama']);
            //             exit();
            //         }

            //         $i++;
            //     }
            // }
        } else if ($tipe == 3) {

            /**
             * Get Data
             */
            $Q_Data = $DB->QueryPort("
                SELECT
                    h.kode po_kode,
                    i.kode inv_kode,
                    i.ref_tgl,
                    h.supplier_kode,
                    h.supplier_nama,
                    d.item,
                    h.currency,
                    h.company,
                    h.customs,
                    h.disc,
                    h.other_cost,
                    h.ppbkb,
                    h.dp,
                    ( SELECT sum( qty_po - qty_cancel ) FROM po_detail WHERE header = h.id ) tot_qty_po,
                    h.inclusive_ppn,
                    h.ppn,
                    d.price,
                    (d.qty_po - d.qty_cancel) AS qty_po,
                    id.qty_invoice,
                                        ( SELECT coa_accrued FROM item_grup_coa WHERE company = h.company AND item_grup_id = ( SELECT grup FROM item WHERE id = d.item ) ) coa_accrued,
                CASE
                        
                        WHEN h.currency = 'IDR' THEN
                        ( SELECT coa FROM trx_coa_balance WHERE doc_nama = 'Purchase Invoice' AND seq = 2 AND company = h.company ) 
                    END coa_uang_muka,
                CASE
                        
                        WHEN h.ppn > 0 THEN
                        (
                        SELECT
                            id 
                        FROM
                            coa_master 
                        WHERE
                            kode = ( SELECT coa_kode FROM taxmaster WHERE CODE = 'VAT-IN' AND company = h.company ) 
                            AND company = h.company 
                        ) ELSE 0 
                    END coa_ppn,
                CASE
                        
                        WHEN h.ppn > 0 THEN
                        ( SELECT pembukuan FROM taxmaster WHERE CODE = 'VAT-IN' AND company = h.company ) ELSE 0 
                    END coa_pembukuan_ppn,
                CASE
                        
                        WHEN d.pph > 0 THEN
                        (
                        SELECT
                            id 
                        FROM
                            coa_master 
                        WHERE
                            kode = ( SELECT coa_kode FROM taxmaster WHERE CODE = h.pph_code AND company = h.company ) 
                            AND company = h.company 
                        ) ELSE 0 
                    END coa_pph,
                CASE
                        
                        WHEN d.pph > 0 THEN
                        ( SELECT pembukuan FROM taxmaster WHERE CODE = h.pph_code AND company = h.company ) ELSE 0 
                    END coa_pembukuan_pph,
                    (
                        (
                            (
                                ( 100- h.disc ) / 100 * ( CASE WHEN h.inclusive_ppn = 1 THEN d.price / 1.1 ELSE d.price END * id.qty_invoice ) 
                            ) 
                        ) * ( h.pph / 100 ) 
                        ) - (
                        (
                            (
                                ( 100- h.disc ) / 100 * (
                                CASE
                                        
                                        WHEN h.inclusive_ppn = 1 THEN
                                        d.price / 1.1 ELSE d.price 
                                    END * ( id.qty_invoice / 100 * h.dp ) 
                                ) 
                            ) 
                        ) * ( h.pph / 100 ) 
                    ) amount_pph,
                CASE
                        
                    WHEN h.currency = 'IDR' THEN
                    ( SELECT coa FROM pihakketiga_coa WHERE pihakketiga_tipe = 0 AND company = h.company AND pihakketiga = h.supplier AND coa_accrued IS NOT NULL AND status = 1 ) 
                END coa_hutang_supplier,
                    i.note 
                FROM
                    po h,
                    po_detail d,
                    invoice i,
                    invoice_detail id 
                WHERE
                    i.id = " . $id . " 
                    AND h.id = d.header 
                    AND h.id = i.po 
                    AND i.id = id.header 
                    AND d.item = id.item");
            $R_Data = $DB->Row($Q_Data);

            if ($R_Data > 0) {
                $i = 0;
                while ($Data = $DB->Result($Q_Data)) {
                    $amount_accrued = 0;
                    $amount_uang_muka = 0;
                    $amount_ppn = 0;
                    $amount_pph = 0;

                    if ($Data['coa_accrued'] != 0) {
                        $tot_oc = $Data['other_cost'] / $Data['tot_qty_po'] * $Data['qty_invoice'];
                        $tot_ppbkb = $Data['ppbkb'] / $Data['tot_qty_po'] * $Data['qty_invoice'];

                        $price = $Data['price'];
                        if ($Data['inclusive_ppn']) {
                            $price = $Data['price'] / 1.1;
                        }

                        $amount_accrued = (($tot_oc + $tot_ppbkb) + ((100 - $Data['disc']) / 100 * ($price * $Data['qty_invoice'])));

                        $Jurnal = App::JurnalPosting(array(
                            'trx_type'      => 6,
                            'tipe'          => 'debit',
                            'company'       => $Data['company'],
                            'source'        => $Data['inv_kode'],
                            'target'        => $Data['po_kode'],
                            'target_2'      => $Data['item'],
                            'currency'      => $Data['currency'],
                            'rate'          => 1,
                            'coa'           => $Data['coa_accrued'],
                            'value'         => $amount_accrued,
                            'kode'          => $Data['inv_kode'],
                            'tanggal'       => $Data['ref_tgl'],
                            'keterangan'    => $Data['note']
                        ));
                        //=> / END : Insert to Jurnal Posting and Update Balance

                        $return['jurnalPosting'][$i] = $Jurnal['msg'];
                    }

                    if ($Data['coa_uang_muka'] != 0) {
                        $tot_oc = $Data['other_cost'] / $Data['tot_qty_po'] * $Data['qty_invoice'];
                        $tot_ppbkb = $Data['ppbkb'] / $Data['tot_qty_po'] * $Data['qty_invoice'];

                        $price = $Data['price'];
                        if ($Data['inclusive_ppn']) {
                            $price = $Data['price'] / 1.1;
                        }

                        $amount_uang_muka = (($tot_oc + $tot_ppbkb) + ((100 - $Data['disc']) / 100 * ($price * $Data['qty_invoice']))) / 100 * $Data['dp'];

                        if ($amount_uang_muka > 0) {
                            $Jurnal = App::JurnalPosting(array(
                                'trx_type'      => 6,
                                'tipe'          => 'credit',
                                'company'       => $Data['company'],
                                'source'        => $Data['inv_kode'],
                                'target'        => $Data['po_kode'],
                                'target_2'      => $Data['item'],
                                'currency'      => $Data['currency'],
                                'rate'          => 1,
                                'coa'           => $Data['coa_uang_muka'],
                                'value'         => $amount_uang_muka,
                                'kode'          => $Data['inv_kode'],
                                'tanggal'       => $Data['ref_tgl']
                            ));
                            //=> / END : Insert to Jurnal Posting and Update Balance
                        }
                    }

                    if ($Data['amount_ppn'] > 0 && $Data['coa_ppn'] != 0) {
                        $amount_ppn = ($amount_accrued - $amount_uang_muka) * ($Data['ppn'] / 100);

                        $Jurnal = App::JurnalPosting(array(
                            'trx_type'      => 6,
                            'tipe'          => $Data['coa_pembukuan_ppn'],
                            'company'       => $Data['company'],
                            'source'        => $Data['inv_kode'],
                            'target'        => $Data['po_kode'],
                            'target_2'      => $Data['item'],
                            'currency'      => $Data['currency'],
                            'rate'          => 1,
                            'coa'           => $Data['coa_ppn'],
                            'value'         => $amount_ppn,
                            'kode'          => $Data['inv_kode'],
                            'tanggal'       => $Data['ref_tgl']
                        ));
                        //=> / END : Insert to Jurnal Posting and Update Balance
                    }

                    if ($Data['amount_pph'] != 0 && $Data['coa_pph'] != 0) {
                        $return['pembukuan_pph'] = $Data['coa_pembukuan_pph'];
                        if ($Data['coa_pembukuan_pph'] == 'debit') {
                            $amount_pph = -1 * $Data['amount_pph'];
                        } else {
                            $amount_pph = $Data['amount_pph'];
                        }

                        $Jurnal = App::JurnalPosting(array(
                            'trx_type'      => 6,
                            'tipe'          => $Data['coa_pembukuan_pph'],
                            'company'       => $Data['company'],
                            'source'        => $Data['inv_kode'],
                            'target'        => $Data['po_kode'],
                            'target_2'      => $Data['item'],
                            'currency'      => $Data['currency'],
                            'rate'          => 1,
                            'coa'           => $Data['coa_pph'],
                            'value'         => $amount_pph,
                            'kode'          => $Data['inv_kode'],
                            'tanggal'       => $Data['ref_tgl']
                        ));
                        //=> / END : Insert to Jurnal Posting and Update Balance
                    }

                    if ($Data['coa_hutang_supplier'] != 0) {

                        if ($Data['coa_pembukuan_pph'] == 'debit') {
                            $amount_pph = -1 * $Data['amount_pph'];
                        } else {
                            $amount_pph = $Data['amount_pph'];
                        }

                        $amount_hutang_supplier = $amount_accrued - $amount_uang_muka + $amount_ppn - $amount_pph;

                        $Jurnal = App::JurnalPosting(array(
                            'trx_type'      => 6,
                            'tipe'          => 'credit',
                            'company'       => $Data['company'],
                            'source'        => $Data['inv_kode'],
                            'target'        => $Data['supplier_kode'],
                            'target_2'      => $Data['item'],
                            'currency'      => $Data['currency'],
                            'rate'          => 1,
                            'coa'           => $Data['coa_hutang_supplier'],
                            'value'         => $amount_hutang_supplier,
                            'kode'          => $Data['inv_kode'],
                            'tanggal'       => $Data['ref_tgl']
                        ));
                        //=> / END : Insert to Jurnal Posting and Update Balance
                    } else {
                        $DB->LogError("Please define default activity/account for this supplier " . $Data['supplier_nama']);
                        exit();
                    }

                    $i++;
                }
            }
            $DB->Commit();
            $return['status'] = 1;
        }
    } else {
        $DB->Commit();
        $return['status'] = 1;
    }

    //=> END L Update PO

} else {
    $return = array(
        'status'    => 0,
        'error_msg' => $GLOBALS['mysql']->error
    );
}
//=> / END: Update Verify

echo Core::ReturnData($return);

?>