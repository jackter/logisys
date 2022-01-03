<?php

$Modid = 47;
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
    'gr'        => 'gr',
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
    'description'   => "Verify Invoice " . $kode
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
    $INV = $DB->Result($DB->Query(
        $Table['def'],
        array(
            'id',
            'ref_tgl',
            'kode',
            'grn_id'
        ),
        "
            WHERE
                id = '" . $id . "'
        "
    ));

    /**
     * Update Status in GRN
     */
    if ($DB->Update(
        $Table['gr'],
        array(
            'inv_verify'    => 1
        ),
        "
            id IN (" . $INV['grn_id'] . ")
        "
    )) {
        /**
         * Get Data
         */

        if ($enable_journal == 1) { //cek enable journal

            $Q_Data = $DB->QueryPort("
                SELECT
                    h.kode po_kode,
                    h.supplier_kode,
                    h.supplier_nama,
                    d.item,
                    h.currency,
                    h.company,
                    SUM(
                        (
                            ( IFNULL( h.other_cost, 0 ) + IFNULL( h.ppbkb, 0 ) ) / ( SELECT sum( qty_po ) FROM po_detail WHERE header = h.id ) * ( dg.qty_receipt - dg.qty_return ) 
                            ) + (
                            ( 100- h.disc ) / 100 * (
                            CASE
                                    
                                    WHEN h.inclusive_ppn = 1 THEN
                                    d.price / 1.1 ELSE d.price 
                                END * ( dg.qty_receipt - dg.qty_return ) 
                            ) 
                        ) 
                    ) amount_accrued,
                    ( SELECT coa FROM trx_coa_balance WHERE doc_nama = 'Purchase Invoice' AND seq = 2 AND company = h.company )  AS coa_uang_muka,
                    SUM(
                        (
                            ( IFNULL( h.other_cost, 0 ) + IFNULL( h.ppbkb, 0 ) ) / ( SELECT sum( qty_po ) FROM po_detail WHERE header = h.id ) * ( ( dg.qty_receipt - dg.qty_return ) / 100 * h.dp ) 
                            ) + (
                            ( 100- h.disc ) / 100 * (
                            CASE
                                    
                                    WHEN h.inclusive_ppn = 1 THEN
                                    d.price / 1.1 ELSE d.price 
                                END * ( ( dg.qty_receipt - dg.qty_return ) / 100 * h.dp ) 
                            ) 
                        ) 
                    ) amount_uang_muka,
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
                    SUM(
                    CASE
                            
                            WHEN h.customs = 1 THEN
                            0 ELSE (
                                (
                                    (
                                        ( 100- h.disc ) / 100 * (
                                        CASE
                                                
                                                WHEN h.inclusive_ppn = 1 THEN
                                                d.price / 1.1 ELSE d.price 
                                            END * ( dg.qty_receipt - dg.qty_return ) 
                                        ) 
                                    ) 
                                ) * ( h.ppn / 100 ) 
                                ) - (
                                (
                                    (
                                        ( 100- h.disc ) / 100 * (
                                        CASE
                                                
                                                WHEN h.inclusive_ppn = 1 THEN
                                                d.price / 1.1 ELSE d.price 
                                            END * ( ( dg.qty_receipt - dg.qty_return ) / 100 * h.dp ) 
                                        ) 
                                    ) 
                                ) * ( h.ppn / 100 ) 
                            ) 
                        END 
                        ) amount_ppn,
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
                    SUM(
                        (
                            (
                                (
                                    ( 100- h.disc ) / 100 * (
                                    CASE
                                            
                                            WHEN h.inclusive_ppn = 1 THEN
                                            d.price / 1.1 ELSE d.price 
                                        END * ( dg.qty_receipt - dg.qty_return ) 
                                    ) 
                                ) 
                            ) * ( h.pph / 100 ) 
                            ) - (
                            (
                                (
                                    ( 100- h.disc ) / 100 * (
                                    CASE
                                            
                                            WHEN h.inclusive_ppn = 1 THEN
                                            d.price / 1.1 ELSE d.price 
                                        END * ( ( dg.qty_receipt - dg.qty_return ) / 100 * h.dp ) 
                                    ) 
                                ) 
                            ) * ( h.pph / 100 ) 
                        ) 
                    ) amount_pph,
                    (
                        SELECT
                            coa 
                        FROM
                            pihakketiga_coa 
                        WHERE
                            pihakketiga_tipe = 0 
                            AND company = h.company 
                            AND pihakketiga = h.supplier 
                            AND coa IS NOT NULL 
                            AND STATUS = 1 
                        )
                    AS coa_hutang_supplier,
                    (
                        SELECT
                            coa_accrued 
                        FROM
                            pihakketiga_coa 
                        WHERE
                            pihakketiga_tipe = 0 
                            AND company = h.company 
                            AND pihakketiga = h.supplier 
                            AND coa_accrued IS NOT NULL 
                            AND STATUS = 1 
                        )
                    AS coa_accrued,
                    i.note 
                FROM
                    po h,
                    po_detail d,
                    gr hg,
                    gr_detail dg,
                    invoice i,
                    item it 
                WHERE
                    h.id = d.header 
                    AND h.id = hg.po 
                    AND hg.id = dg.header 
                    AND dg.item = it.id 
                    AND hg.inv = i.id 
                    AND d.item = dg.item 
                    AND hg.id IN ( " . $INV['grn_id'] . " )");
            $R_Data = $DB->Row($Q_Data);

            if ($R_Data > 0) {
                $i = 0;
                while ($Data = $DB->Result($Q_Data)) {
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
                                    AND '" . $INV['ref_tgl'] . "' <= param_val
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
                                        tanggal <= '" . $INV['ref_tgl'] . "' 
                                        AND cur_kode = '" . $Data['currency'] . "'
                                    ORDER BY tanggal desc 
                                    LIMIT 1
                                "
                            ));
        
                            $rate = $exchange['rate'];
                        }
                        else{
                            $DB->LogError("Exchange rate is not defined at " . $INV['ref_tgl'] . " for " . $Data['currency']);
                            exit();
                        }
                    }

                    if ($Data['coa_accrued'] > 0) {
                        $Jurnal = App::JurnalPosting(array(
                            'trx_type'      => 6,
                            'tipe'          => 'debit',
                            'company'       => $Data['company'],
                            'source'        => $INV['kode'],
                            'target'        => $Data['po_kode'],
                            'item'          => $Data['item'],
                            'currency'      => $Data['currency'],
                            'rate'          => $rate,
                            'coa'           => $Data['coa_accrued'],
                            'value'         => $Data['amount_accrued'],
                            'kode'          => $INV['kode'],
                            'tanggal'       => $INV['ref_tgl'],
                            'keterangan'    => $Data['note']
                        ));
                        //=> / END : Insert to Jurnal Posting and Update Balance

                        $return['jurnalPosting'][$i] = $Jurnal['msg'];
                    }

                    if ($Data['amount_uang_muka'] > 0) {
                        $Jurnal = App::JurnalPosting(array(
                            'trx_type'      => 6,
                            'tipe'          => 'credit',
                            'company'       => $Data['company'],
                            'source'        => $INV['kode'],
                            'target'        => $Data['po_kode'],
                            'item'          => $Data['item'],
                            'currency'      => $Data['currency'],
                            'rate'          => $rate,
                            'coa'           => $Data['coa_uang_muka'],
                            'value'         => $Data['amount_uang_muka'],
                            'kode'          => $INV['kode'],
                            'tanggal'       => $INV['ref_tgl'],
                            'keterangan'    => $Data['note']
                        ));
                        //=> / END : Insert to Jurnal Posting and Update Balance

                        $return['jurnalPosting'][$i] = $Jurnal['msg'];
                    }

                    if ($Data['amount_ppn'] > 0 && $Data['coa_ppn'] > 0) {
                        $Jurnal = App::JurnalPosting(array(
                            'trx_type'      => 6,
                            'tipe'          => $Data['coa_pembukuan_ppn'],
                            'company'       => $Data['company'],
                            'source'        => $INV['kode'],
                            'target'        => $Data['po_kode'],
                            'item'          => $Data['item'],
                            'currency'      => $Data['currency'],
                            'rate'          => $rate,
                            'coa'           => $Data['coa_ppn'],
                            'value'         => $Data['amount_ppn'],
                            'kode'          => $INV['kode'],
                            'tanggal'       => $INV['ref_tgl'],
                            'keterangan'    => $Data['note']
                        ));
                        //=> / END : Insert to Jurnal Posting and Update Balance

                        $return['jurnalPosting'][$i] = $Jurnal['msg'];
                    }

                    if ($Data['amount_pph'] != 0 && $Data['coa_pph'] > 0) {
                        if ($Data['coa_pembukuan_pph'] == 'debit') {
                            $amount_pph = -1 * $Data['amount_pph'];
                        } else {
                            $amount_pph = $Data['amount_pph'];
                        }
                        $Jurnal = App::JurnalPosting(array(
                            'trx_type'      => 6,
                            'tipe'          => $Data['coa_pembukuan_pph'],
                            'company'       => $Data['company'],
                            'source'        => $INV['kode'],
                            'target'        => $Data['po_kode'],
                            'item'          => $Data['item'],
                            'currency'      => $Data['currency'],
                            'rate'          => $rate,
                            'coa'           => $Data['coa_pph'],
                            'value'         => $amount_pph,
                            'kode'          => $INV['kode'],
                            'tanggal'       => $INV['ref_tgl'],
                            'keterangan'    => $Data['note']
                        ));
                        //=> / END : Insert to Jurnal Posting and Update Balance

                        $return['jurnalPosting'][$i] = $Jurnal['msg'];
                    }

                    if ($Data['coa_hutang_supplier'] > 0) {
                        if (($Data['amount_accrued'] + $Data['amount_ppn'] - $Data['amount_uang_muka'] - $Data['amount_pph']) != 0) {
                            $Jurnal = App::JurnalPosting(array(
                                'trx_type'      => 6,
                                'tipe'          => 'credit',
                                'company'       => $Data['company'],
                                'source'        => $INV['kode'],
                                'target'        => $Data['supplier_kode'],
                                'item'          => $Data['item'],
                                'currency'      => $Data['currency'],
                                'rate'          => $rate,
                                'coa'           => $Data['coa_hutang_supplier'],
                                'value'         => $Data['amount_accrued'] + $Data['amount_ppn'] - $Data['amount_uang_muka'] - $Data['amount_pph'],
                                'kode'          => $INV['kode'],
                                'tanggal'       => $INV['ref_tgl'],
                                'keterangan'    => $Data['note']
                            ));
                            //=> / END : Insert to Jurnal Posting and Update Balance

                            $return['jurnalPosting'][$i] = $Jurnal['msg'];
                        }
                    } else {
                        $DB->LogError("Please define default activity/account for this supplier " . $Data['supplier_nama']);
                        exit();
                    }

                    $i++;
                }
            }
        }
        // => END : cek enable journal

        $DB->Commit();
        $return['status'] = 1;
    }
    // => End : Update status GRN
} else {
    $return = array(
        'status'    => 0,
        'error_msg' => $GLOBALS['mysql']->error
    );
}
//=> / END: Update Verify

echo Core::ReturnData($return);

?>