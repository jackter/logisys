<?php
    $company = strip_tags($_GET['company']);
    $year = strip_tags($_GET['year']);
    $month = strip_tags($_GET['month']);
    $modul = strip_tags($_GET['modul']);

    class Reclosing {

        public function closingBalance($company, $year, $month){
            // $DB = new DB;
            global $DB;

            if($DB->Delete(
                "journal_balance",
                "company = '" . $company . "'
                AND year = '" . $year . "'
                AND month = '" . $month . "'"
            )){
                $Q_Journal_GR = $DB->Query(
                    "journal",
                    array(
                        'company', 
                        'company_abbr',
                        'company_nama',
                        'coa',
                        'coa_kode',
                        'coa_nama',
                        'debit', 
                        'credit'
                    ),
                    "
                    WHERE 
                        company = '" . $company . "'
                        AND DATE_FORMAT(tanggal,'%Y') = '" . $year. "'
                        AND CAST(DATE_FORMAT(tanggal,'%m') AS SIGNED) = '" . $month. "'
                    ORDER BY tanggal
                    "
                );
                $R_Journal_GR = $DB->Row($Q_Journal_GR);
                if($R_Journal_GR > 0){
                    while($Journal_GR = $DB->Result($Q_Journal_GR)){
                        if($Journal_GR['debit'] != 0){
                            $value = $Journal_GR['debit'];
                            $type = 'debit';
                        }
                        else{
                            $value = $Journal_GR['credit'] * -1;
                            $type = 'credit';
                        }
                        
                        if($value != 0 && $Journal_GR['coa'] != 0){
                            $UpdateBalance = App::UpdateJournalBalance(array(
                                'tipe'          => $type,
                                'year'          => $year,
                                'month'         => $month,
                                'company'       => $Journal_GR['company'],
                                'company_abbr'  => $Journal_GR['company_abbr'],
                                'company_nama'  => $Journal_GR['company_nama'],
                                'coa'           => $Journal_GR['coa'],
                                'coa_kode'      => $Journal_GR['coa_kode'],
                                'coa_nama'      => $Journal_GR['coa_nama'],
                                'value'         => $value
                            ));
                        }
                    }
                }
            }

            echo "Finish Update Balance.<br/>";
        }

        /**
         * Trx ID = 1
         */
        public function closingGR($company, $year, $month){
            // $DB = new DB;
            global $DB;

            if($DB->Delete(
                "journal",
                "company = ".$company." 
                AND YEAR ( tanggal ) = ".$year." 
                AND MONTH ( tanggal ) = ".$month."
                AND DOC_ID = 1"
            )){
                $Q_AllGRs = $DB->QueryPort("
                    SELECT
                        x.id,
                        x.po,
                        x.tanggal,
                        x.kode
                    FROM
                        gr x
                    WHERE
                        x.company = ".$company." 
                        AND YEAR ( x.tanggal ) = ".$year." 
                        AND MONTH ( x.tanggal ) = ".$month." 
                    ORDER BY
                        x.tanggal, x.kode
                ");
        
                $R_AllGRs = $DB->Row($Q_AllGRs);
        
                if($R_AllGRs > 0){
                    while($Data = $DB->Result($Q_AllGRs)){
                        /**
                         * START : Posting Jurnal
                         */
                        $Q_AllGR = $DB->QueryPort("
                            SELECT
                                x.kode,
                                x.po_kode,
                                x.supplier_kode,
                                x.tanggal,
                                x.remarks,
                                y.item,
                                y.qty_receipt,
                                y.price,
                                y.storeloc_kode
                            FROM
                                gr x,
                                gr_detail y
                            WHERE
                                x.id = ".$Data['id']."
                                AND x.id = y.header
                        ");
                        
                        $R_AllGR = $DB->Row($Q_AllGR);

                        if($R_AllGR > 0){
                            $arrCurGR = [];

                            $PO = $DB->Result($DB->QueryPort("
                                SELECT
                                    x.kode,
                                    x.other_cost,
                                    x.currency,
                                    x.supplier_kode,
                                    sum( y.qty_po ) tot_qty
                                FROM
                                    po x,
                                    po_detail y 
                                WHERE
                                    x.id = y.header 
                                    AND x.id = ".$Data['po']."
                            "));

                            $po_kode = $PO['kode'];
                            $kode = $Data['kode'];
                            $sum_qty_po = $PO['tot_qty'];
                            $other_cost = $PO['other_cost'];
                            $supplier_kode = $PO['supplier_kode'];
                            $currency = $PO['currency'];
                            $tanggal = $Data['tanggal'];

                            $i = 0;
                            while($GR = $DB->Result($Q_AllGR)){
                                $arrCurGR[$i] = $GR;
                                $i++;
                                
                                $COA_Othercost = $DB->Result($DB->Query(
                                    "trx_coa_balance",
                                    array(
                                        'coa', 
                                        'coa_kode', 
                                        'coa_nama'       
                                    ),
                                    "
                                    WHERE
                                        doc_nama = 'Good Receipt' 
                                        AND seq = 1 
                                        and company = ".$company."
                                    "
                                ));
                        
                                /**
                                * Select Item COA
                                */
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
                                        item_id = '" . $GR['item'] . "'
                                        AND company = ".$company."
                                    "
                                );
                                $R_COA_Item = $DB->Row($Q_COA_Item);
                                if($R_COA_Item > 0){
                                    $COA_Item = $DB->Result($Q_COA_Item);
                        
                                    if($COA_Item['item_type'] == 1 && $COA_Item['coa_persediaan']){
                                        $Jurnal = App::JurnalPosting(array(
                                            'trx_type'      => 1,
                                            'tipe'          => 'debit',
                                            'company'       => $company,
                                            'source'        => $GR['po_kode'],
                                            'target'        => $GR['storeloc_kode'],
                                            'target_2'      => $GR['item'],
                                            'currency'      => 'IDR',
                                            'rate'          => 1,
                                            'coa'           => $COA_Item['coa_persediaan'],
                                            'value'         => ($GR['price'] * $GR['qty_receipt']),
                                            'kode'          => $GR['kode'],
                                            'tanggal'       => $GR['tanggal'],
                                            'keterangan'    => $GR['remarks']
                                        ));
                                        //=> / END : Insert to Jurnal Posting and Update Balance
                                    }
                                    else if($COA_Item['item_type'] == 2 && $COA_Item['coa_beban']){
                                        $Jurnal = App::JurnalPosting(array(
                                            'trx_type'      => 1,
                                            'tipe'          => 'debit',
                                            'company'       => $company,
                                            'source'        => $GR['po_kode'],
                                            'target'        => $GR['storeloc_kode'],
                                            'target_2'      => $GR['item'],
                                            'currency'      => 'IDR',
                                            'rate'          => 1,
                                            'coa'           => $COA_Item['coa_beban'],
                                            'value'         => ($GR['price'] * $GR['qty_receipt']),
                                            'kode'          => $GR['kode'],
                                            'tanggal'       => $GR['tanggal'],
                                            'keterangan'    => $GR['remarks']
                                        ));
                                        //=> / END : Insert to Jurnal Posting and Update Balance
                                    }
                        
                                    if($other_cost > 0){
                                        $Jurnal = App::JurnalPosting(array(
                                            'trx_type'      => 1,
                                            'tipe'          => 'debit',
                                            'company'       => $company,
                                            'source'        => $GR['po_kode'],
                                            'target'        => $GR['storeloc_kode'],
                                            'target_2'      => $GR['item'],
                                            'currency'      => 'IDR',
                                            'rate'          => 1,
                                            'coa'           => $COA_Othercost['coa'],
                                            'value'         => ($GR['price'] * $GR['qty_receipt']),
                                            'kode'          => $GR['kode'],
                                            'tanggal'       => $GR['tanggal'],
                                            'keterangan'    => 'Other Cost'
                                        ));
                                        //=> / END : Insert to Jurnal Posting and Update Balance
                                    }
                                }
                                //=> / END : Posting Jurnal
                            }

                            $arrCredit = [];
                            $j = 0;
                            for($i = 0; $i < sizeof($arrCurGR); $i++){
                                if($arrCurGR[$i]['qty_receipt'] > 0){
                                    /**
                                     * Insert to Jurnal Posting and Update Balance
                                     */

                                    /**
                                    * Select Item COA
                                    */
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
                                            item_id = '" . $arrCurGR[$i]['item'] . "'
                                            AND company = ".$company."
                                        "
                                    );
                                    $R_COA_Item = $DB->Row($Q_COA_Item);
                                    if($R_COA_Item > 0){
                                        $COA_Item = $DB->Result($Q_COA_Item);
                                        if($j == 0){
                                            $arrCredit[$j]['coa'] = $COA_Item['coa_accrued'];
                                            $arrCredit[$j]['total_price'] = $arrCredit[$j]['total_price'] + ($arrCurGR[$i]['price'] * $arrCurGR[$i]['qty_receipt']) + (($other_cost / $sum_qty_po) * $arrCurGR[$i]['qty_receipt']);
                                            $j++;
                                        }
                                        else{
                                            for($x = 0; $x < $j; $x++){
                                                if($arrCredit[$x]['coa'] == $COA_Item['coa_accrued']){
                                                    $arrCredit[$j-1]['total_price'] = $arrCredit[$j-1]['total_price'] + ($arrCurGR[$i]['price'] * $arrCurGR[$i]['qty_receipt']) + (($other_cost / $sum_qty_po) * $arrCurGR[$i]['qty_receipt']);
                                                    $x = $j + 1;
                                                }
                                            }
                                            if($x == $j){
                                                $arrCredit[$j]['coa'] = $COA_Item['coa_accrued'];
                                                $arrCredit[$j]['total_price'] = $arrCredit[$j]['total_price'] + ($arrCurGR[$i]['price'] * $arrCurGR[$i]['qty_receipt']) + (($other_cost / $sum_qty_po) * $arrCurGR[$i]['qty_receipt']);
                                                $j++;
                                            }
                                        }
                                    }
                                }
                            }

                            for($y = 0; $y < $j; $y++){
                                /**
                                 * Insert to Jurnal Posting and Update Balance
                                */

                                $Jurnal = App::JurnalPosting(array(
                                    'trx_type'      => 1,
                                    'tipe'          => 'credit',
                                    'company'       => $company,
                                    'source'        => $po_kode,
                                    'target'        => $supplier_kode,
                                    'currency'      => $currency,
                                    'rate'          => 1,
                                    'coa'           => $arrCredit[$y]['coa'],
                                    'value'         => $arrCredit[$y]['total_price'],
                                    'kode'          => $kode,
                                    'tanggal'       => $tanggal
                                ));
                                //=> / END : Insert to Jurnal Posting and Update Balance
                            }
                        }
                    }
                }
            }

            echo "Finish Posting GR.<br/>";
        }
    
        /**
         * Trx ID = 2
         */
        function closingGI($company, $year, $month){
            // $DB = new DB;
            global $DB;

            if($DB->Delete(
                "journal",
                "company = ".$company." 
                AND YEAR ( tanggal ) = ".$year." 
                AND MONTH ( tanggal ) = ".$month."
                AND DOC_ID = 2"
            )){
                $Q_AllGI = $DB->QueryPort("
                    SELECT
                        x.kode,
                        x.tanggal,
                        x.remarks,
                        y.item,
                        y.qty_gi,
                        y.price,
                        y.storeloc_kode,
                        y.cost_center_kode,
                        y.coa
                    FROM
                        gi x,
                        gi_detail y 
                    WHERE
                        x.id = y.header
                        AND x.jurnal = 1
                        AND x.company = ".$company." 
                        AND YEAR ( x.tanggal ) = ".$year."
                        AND MONTH ( x.tanggal ) = ".$month." 
                    ORDER BY
                        x.tanggal, x.kode
                ");
        
                $R_AllGI = $DB->Row($Q_AllGI);
        
                if($R_AllGI > 0){
                    while($GI = $DB->Result($Q_AllGI)){
                        /**
                         * START : Posting Jurnal
                         */
                        
                        /**
                        * Select Item COA
                        */
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
                                item_id = '" . $GI['item'] . "'
                                AND company = ".$company."
                            "
                        );
                        $R_COA_Item = $DB->Row($Q_COA_Item);
                        if($R_COA_Item > 0){
                            $COA_Item = $DB->Result($Q_COA_Item);

                            if(!$GI['cost_center_kode']){
                                $GI['cost_center_kode'] = "X";
                            }

                            $Jurnal = App::JurnalPosting(array(
                                'trx_type'      => 2,
                                'tipe'          => 'debit',
                                'company'       => $company,
                                'source'        => $GI['storeloc_kode'],
                                'target'        => $GI['cost_center_kode'],
                                'target_2'      => $GI['item'],
                                'currency'      => 'IDR',
                                'rate'          => 1,
                                'coa'           => $GI['coa'],
                                'value'         => $GI['qty_gi'] * $GI['price'],
                                'kode'          => $GI['kode'],
                                'tanggal'       => $GI['tanggal']
                            ));
                            //=> / END : Insert to Jurnal Posting and Update Balance

                            if($COA_Item['item_type'] == 1){
                                $Jurnal = App::JurnalPosting(array(
                                    'trx_type'      => 2,
                                    'tipe'          => 'credit',
                                    'company'       => $company,
                                    'source'        => $GI['storeloc_kode'],
                                    'target'        => $GI['cost_center_kode'],
                                    'target_2'      => $GI['item'],
                                    'currency'      => 'IDR',
                                    'rate'          => 1,
                                    'coa'           => $COA_Item['coa_persediaan'],
                                    'value'         => $GI['qty_gi'] * $GI['price'],
                                    'kode'          => $GI['kode'],
                                    'tanggal'       => $GI['tanggal']
                                ));
                                //=> / END : Insert to Jurnal Posting and Update Balance
                            }
                            else if($COA_Item['item_type'] == 2){
                                $Jurnal = App::JurnalPosting(array(
                                    'trx_type'      => 2,
                                    'tipe'          => 'credit',
                                    'company'       => $company,
                                    'source'        => $GI['storeloc_kode'],
                                    'target'        => $GI['cost_center_kode'],
                                    'target_2'      => $GI['item'],
                                    'currency'      => 'IDR',
                                    'rate'          => 1,
                                    'coa'           => $COA_Item['coa_beban'],
                                    'value'         => $GI['qty_gi'] * $GI['price'],
                                    'kode'          => $GI['kode'],
                                    'tanggal'       => $GI['tanggal']
                                ));
                                //=> / END : Insert to Jurnal Posting and Update Balance
                            }
                        }
                        //=> / END : Posting Jurnal
                    }
                }
            }

            echo "Finish Posting GI.<br/>";
        }
    
        /**
         * Trx ID = 3
         */
        function closingRGR($company, $year, $month){
            // $DB = new DB;
            global $DB;

            if($DB->Delete(
                "journal",
                "company = ".$company." 
                AND YEAR ( tanggal ) = ".$year." 
                AND MONTH ( tanggal ) = ".$month."
                AND DOC_ID = 3"
            )){
                $Q_AllRGRs = $DB->QueryPort("
                    SELECT
                        x.id,
                        x.gr,
                        x.po,
                        x.tanggal,
                        x.kode
                    FROM
                        rgr x
                    WHERE
                        x.company = ".$company." 
                        AND YEAR ( x.tanggal ) = ".$year." 
                        AND MONTH ( x.tanggal ) = ".$month." 
                    ORDER BY
                        x.tanggal, x.kode
                ");
        
                $R_AllRGRs = $DB->Row($Q_AllRGRs);
        
                if($R_AllRGRs > 0){
                    while($Data = $DB->Result($Q_AllRGRs)){
                        /**
                         * START : Posting Jurnal
                         */
                        $Q_AllRGR = $DB->QueryPort("
                            SELECT
                                x.kode,
                                x.po_kode,
                                x.supplier_kode,
                                x.tanggal,
                                x.remarks,
                                y.item,
                                y.qty_return,
                                y.price,
                                y.storeloc_kode
                            FROM
                                rgr x,
                                rgr_detail y
                            WHERE
                                x.id = ".$Data['id']."
                                AND x.id = y.header
                        ");
                        
                        $R_AllRGR = $DB->Row($Q_AllRGR);

                        if($R_AllRGR > 0){
                            $arrCurRGR = [];
                            $i = 0;

                            $arrDebit = [];
                            $j = 0;

                            $PO = $DB->Result($DB->QueryPort("
                                SELECT
                                    x.kode,
                                    x.other_cost,
                                    x.currency,
                                    x.supplier_kode,
                                    sum( y.qty_po ) tot_qty
                                FROM
                                    po x,
                                    po_detail y 
                                WHERE
                                    x.id = y.header 
                                    AND x.id = ".$Data['po']."
                            "));

                            $po_kode = $PO['kode'];
                            $kode = $Data['kode'];
                            $sum_qty_po = $PO['tot_qty'];
                            $other_cost = $PO['other_cost'];
                            $supplier_kode = $PO['supplier_kode'];
                            $currency = $PO['currency'];
                            $tanggal = $Data['tanggal'];

                            while($RGR = $DB->Result($Q_AllRGR)){
                                $arrCurRGR[$i] = $RGR;
                                $i++;

                                /**
                                * Select Item COA
                                */
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
                                        item_id = '" . $RGR['item'] . "'
                                        AND company = ".$company."
                                    "
                                );
                                $R_COA_Item = $DB->Row($Q_COA_Item);
                                if($R_COA_Item > 0){
                                    $COA_Item = $DB->Result($Q_COA_Item);
                                    if($j == 0){
                                        $arrDebit[$j]['coa'] = $COA_Item['coa_accrued'];
                                        $arrDebit[$j]['total_price'] = $arrDebit[$j]['total_price'] + ($RGR['price'] * $RGR['qty_return']) + (($other_cost / $sum_qty_po) * $RGR['qty_return']);
                                        $j++;
                                    }
                                    else{
                                        for($x = 0; $x < $j; $x++){
                                            if($arrDebit[$x]['coa'] == $COA_Item['coa_accrued']){
                                                $arrDebit[$j-1]['total_price'] = $arrDebit[$j-1]['total_price'] + ($RGR['price'] * $RGR['qty_return']) + (($other_cost / $sum_qty_po) * $RGR['qty_return']);
                                                $x = $j + 1;
                                            }
                                        }
                                        if($x == $j){
                                            $arrDebit[$j]['coa'] = $COA_Item['coa_accrued'];
                                            $arrDebit[$j]['total_price'] = $arrDebit[$j]['total_price'] + ($RGR['price'] * $RGR['qty_return']) + (($other_cost / $sum_qty_po) * $RGR['qty_return']);
                                            $j++;
                                        }
                                    }
                                }
                            }

                            for($y = 0; $y < $j; $y++){
                                /**
                                 * Insert to Jurnal Posting and Update Balance
                                */
                    
                                $Jurnal = App::JurnalPosting(array(
                                    'trx_type'      => 3,
                                    'tipe'          => 'debit',
                                    'company'       => $company,
                                    'source'        => $po_kode,
                                    'target'        => $supplier_kode,
                                    'currency'      => $currency,
                                    'rate'          => 1,
                                    'coa'           => $arrDebit[$y]['coa'],
                                    'value'         => $arrDebit[$y]['total_price'],
                                    'kode'          => $kode,
                                    'tanggal'       => $tanggal
                                ));
                                //=> / END : Insert to Jurnal Posting and Update Balance
                            }

                            for($i = 0; $i < sizeof($arrCurRGR); $i++){
                                if(!empty($arrCurRGR[$i]['item']) && $arrCurRGR[$i]['qty_return'] != 0){
                                    /**
                                     * Insert to Jurnal Posting and Update Balance
                                     */

                                    $COA_Othercost = $DB->Result($DB->Query(
                                        "trx_coa_balance",
                                        array(
                                            'coa', 
                                            'coa_kode', 
                                            'coa_nama'       
                                        ),
                                        "
                                        WHERE
                                            doc_nama = 'Return Good Receipt' 
                                            AND seq = 1 
                                            and company = ".$company."
                                        "
                                    ));
                
                                    /**
                                    * Select Item COA
                                    */
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
                                            item_id = '" . $arrCurRGR[$i]['item'] . "'
                                            AND company = ".$company."
                                        "
                                    );
                                    
                                    $R_COA_Item = $DB->Row($Q_COA_Item);
                                    if($R_COA_Item > 0){
                                        $COA_Item = $DB->Result($Q_COA_Item);
                                        if($COA_Item['item_type'] == 1){
                                            $Jurnal = App::JurnalPosting(array(
                                                'trx_type'      => 3,
                                                'tipe'          => 'credit',
                                                'company'       => $company,
                                                'source'        => $po_kode,
                                                'target'        => $arrCurRGR[$i]['storeloc_kode'],
                                                'target_2'      => $arrCurRGR[$i]['item'],
                                                'currency'      => $currency,
                                                'rate'          => 1,
                                                'coa'           => $COA_Item['coa_persediaan'],
                                                'value'         => ($arrCurRGR[$i]['price'] * $arrCurRGR[$i]['qty_return']),
                                                'kode'          => $kode,
                                                'tanggal'       => $tanggal
                                            ));
                                            //=> / END : Insert to Jurnal Posting and Update Balance
                                        }
                                        else if($COA_Item['item_type'] == 2){
                                            $Jurnal = App::JurnalPosting(array(
                                                'trx_type'      => 3,
                                                'tipe'          => 'credit',
                                                'company'       => $company,
                                                'source'        => $po_kode,
                                                'target'        => $arrCurRGR[$i]['storeloc_kode'],
                                                'target_2'      => $arrCurRGR[$i]['item'],
                                                'currency'      => $currency,
                                                'rate'          => 1,
                                                'coa'           => $COA_Item['coa_beban'],
                                                'value'         => ($arrCurRGR[$i]['price'] * $arrCurRGR[$i]['qty_return']),
                                                'kode'          => $kode,
                                                'tanggal'       => $tanggal
                                            ));
                                            //=> / END : Insert to Jurnal Posting and Update Balance
                                        }
                
                                        if($other_cost > 0){
                                            $Jurnal = App::JurnalPosting(array(
                                                'trx_type'      => 3,
                                                'tipe'          => 'credit',
                                                'company'       => $company,
                                                'source'        => $po_kode,
                                                'target'        => $arrCurRGR[$i]['storeloc_kode'],
                                                'target_2'      => $arrCurRGR[$i]['item'],
                                                'currency'      => $currency,
                                                'rate'          => 1,
                                                'coa'           => $COA_Othercost['coa'],
                                                'value'         => ($other_cost / $sum_qty_po) * $arrCurRGR[$i]['qty_return'],
                                                'kode'          => $kode,
                                                'tanggal'       => $tanggal,
                                                'keterangan'    => 'Other Cost'
                                            ));
                                            //=> / END : Insert to Jurnal Posting and Update Balance
                        
                                            $return['detail'][$i]['jurnalPostingDebit'] = $Jurnal['msg'];
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            echo "Finish Posting RGR.<br/>";
        }
    
        /**
         * Trx ID = 4
         */
        function closingRGI($company, $year, $month){
            // $DB = new DB;
            global $DB;

            if($DB->Delete(
                "journal",
                "company = ".$company." 
                AND YEAR ( tanggal ) = ".$year." 
                AND MONTH ( tanggal ) = ".$month."
                AND DOC_ID = 4"
            )){
                $Q_AllRGI = $DB->QueryPort("
                    SELECT
                        xx.kode,
                        xx.tanggal,
                        yy.remarks,
                        yy.item,
                        yy.qty_return,
                        yy.price,
                        y.storeloc_kode,
                        y.cost_center_kode,
                        y.coa
                    FROM
                        gi x,
                        gi_detail y,
                        rgi xx,
                        rgi_detail yy
                    WHERE
                        x.id = y.header
                        AND x.id = xx.gi
                        AND xx.id = yy.header
                        AND xx.company = ".$company." 
                        AND YEAR ( xx.tanggal ) = ".$year." 
                        AND MONTH ( xx.tanggal ) = ".$month."
                    ORDER BY
                            xx.tanggal, xx.kode
                ");
        
                $R_AllRGI = $DB->Row($Q_AllRGI);
        
                if($R_AllRGI > 0){
                    while($RGI = $DB->Result($Q_AllRGI)){
                        /**
                         * START : Posting Jurnal
                         */
                        
                        /**
                        * Select Item COA
                        */
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
                                item_id = '" . $RGI['item'] . "'
                                AND company = ".$company."
                            "
                        );
                        $R_COA_Item = $DB->Row($Q_COA_Item);
                        if($R_COA_Item > 0){
                            $COA_Item = $DB->Result($Q_COA_Item);

                            if($COA_Item['item_type'] == 1){
                                $Jurnal = App::JurnalPosting(array(
                                    'trx_type'      => 4,
                                    'tipe'          => 'debit',
                                    'company'       => $company,
                                    'source'        => $RGI['storeloc_kode'],
                                    'target'        => $RGI['cost_center_kode'],
                                    'target_2'      => $RGI['item'],
                                    'currency'      => 'IDR',
                                    'rate'          => 1,
                                    'coa'           => $COA_Item['coa_persediaan'],
                                    'value'         => ($RGI['qty_return'] * $RGI['price']),
                                    'kode'          => $RGI['kode'],
                                    'tanggal'       => $RGI['tanggal'],
                                    'keterangan'    => $RGI['remarks']
                                ));
                                //=> / END : Insert to Jurnal Posting and Update Balance
                            }
                            else if($COA_Item['item_type'] == 2){
                                $Jurnal = App::JurnalPosting(array(
                                    'trx_type'      => 4,
                                    'tipe'          => 'debit',
                                    'company'       => $company,
                                    'source'        => $RGI['storeloc_kode'],
                                    'target'        => $RGI['cost_center_kode'],
                                    'target_2'      => $RGI['item'],
                                    'currency'      => 'IDR',
                                    'rate'          => 1,
                                    'coa'           => $COA_Item['coa_beban'],
                                    'value'         => ($RGI['qty_return'] * $RGI['price']),
                                    'kode'          => $RGI['kode'],
                                    'tanggal'       => $RGI['tanggal'],
                                    'keterangan'    => $RGI['remarks']
                                ));
                                //=> / END : Insert to Jurnal Posting and Update Balance
                            }

                            $Jurnal = App::JurnalPosting(array(
                                'trx_type'      => 4,
                                'tipe'          => 'credit',
                                'company'       => $company,
                                'source'        => $RGI['storeloc_kode'],
                                'target'        => $RGI['cost_center_kode'],
                                'target_2'      => $RGI['item'],
                                'currency'      => 'IDR',
                                'rate'          => 1,
                                'coa'           => $RGI['coa'],
                                'value'         => ($RGI['qty_return'] * $RGI['price']),
                                'kode'          => $RGI['kode'],
                                'tanggal'       => $RGI['tanggal'],
                                'keterangan'    => $RGI['remarks']
                            ));
                            //=> / END : Insert to Jurnal Posting and Update Balance
                        }
                        //=> / END : Posting Jurnal
                    }
                }
            }

            echo "Finish Posting RGI.<br/>";
        }
    
        /**
         * Trx ID = 5
         */
        function closingINV_DP($company, $year, $month){
            // $DB = new DB;
            global $DB;

            if($DB->Delete(
                "journal",
                "company = ".$company." 
                AND YEAR ( tanggal ) = ".$year." 
                AND MONTH ( tanggal ) = ".$month."
                AND DOC_ID = 5"
            )){
                $Q_AllInvDP = $DB->QueryPort("
                    SELECT
                        h.kode po_kode,
                        i.kode dp_inv_kode,
                        i.ref_tgl,
                        h.supplier_kode,
                        d.item,
                        h.currency,
                        h.company,
                    CASE
                            
                            WHEN h.ppn > 0 THEN
                            ( SELECT id FROM coa_master WHERE kode = ( SELECT coa_kode FROM taxmaster WHERE CODE = 'VAT-IN' ) AND company = h.company ) ELSE 0 
                        END coa_ppn,
                    CASE
                            
                            WHEN h.ppn > 0 THEN
                            ( SELECT pembukuan FROM taxmaster WHERE CODE = 'VAT-IN' ) ELSE 0 
                        END coa_pembukuan_ppn,
                    CASE
                            
                            WHEN h.customs = 1 THEN
                                0
                            ELSE
                                (
                                    ( ( ( 100- h.disc ) / 100 * ( d.price * d.qty_po ) ) ) * ( h.ppn / 100 ) 
                                ) / 100 * h.dp
                        END amount_ppn,
                    CASE
                            
                            WHEN d.pph > 0 THEN
                            ( SELECT id FROM coa_master WHERE kode = ( SELECT coa_kode FROM taxmaster WHERE CODE = h.pph_code ) AND company = h.company ) ELSE 0 
                        END coa_pph,
                    CASE
                            
                            WHEN d.pph > 0 THEN
                            ( SELECT pembukuan FROM taxmaster WHERE CODE = h.pph_code ) ELSE 0 
                        END coa_pembukuan_pph,
                    CASE
                            
                            WHEN d.pph > 0 THEN
                            (
                                ( ( ( 100- h.disc ) / 100 * ( d.price * d.qty_po ) ) ) * ( h.pph / 100 ) 
                            ) / 100 * h.dp ELSE 0 
                        END amount_pph,
                    CASE
                            
                            WHEN h.currency = 'IDR' THEN
                            ( SELECT coa FROM trx_coa_balance WHERE doc_nama = 'Down Payment Invoice' and seq = 2 AND company = h.company ) 
                        END coa_uang_muka,
                        (
                            ( h.other_cost / ( SELECT sum( qty_po ) FROM po_detail WHERE header = h.id ) * d.qty_po ) + ( ( 100- h.disc ) / 100 * ( d.price * d.qty_po ) ) 
                        ) / 100 * h.dp amount_uang_muka,
                    CASE
                            
                            WHEN h.currency = 'IDR' THEN
                            ( SELECT coa FROM trx_coa_balance WHERE doc_nama = 'Down Payment Invoice' and seq = 1 AND company = h.company ) 
                        END coa_hutang_supplier 
                    FROM
                        po h,
                        po_detail d,
                        invoice i 
                    WHERE
                        h.id = d.header 
                        AND i.tipe = 1 
                        AND h.id = i.po
                        AND i.company = ".$company." 
                        AND YEAR ( i.ref_tgl ) = ".$year."
                        AND MONTH ( i.ref_tgl ) = ".$month."
                    ORDER BY i.ref_tgl, i.kode
                ");
        
                $R_AllInvDP = $DB->Row($Q_AllInvDP);
        
                if($R_AllInvDP > 0){
                    while($Data = $DB->Result($Q_AllInvDP)){
                        /**
                         * START : Posting Jurnal
                         */
                        
                        if($Data['amount_ppn'] > 0 && $Data['coa_ppn'] > 0){
                            $Jurnal = App::JurnalPosting(array(
                                'trx_type'      => 5,
                                'tipe'          => $Data['coa_pembukuan_ppn'],
                                'company'       => $Data['company'],
                                'source'        => $Data['dp_inv_kode'],
                                'target'        => $Data['po_kode'],
                                'target_2'      => $Data['item'],
                                'currency'      => $Data['currency'],
                                'rate'          => 1,
                                'coa'           => $Data['coa_ppn'],
                                'value'         => $Data['amount_ppn'],
                                'kode'          => $Data['dp_inv_kode'],
                                'tanggal'       => $Data['ref_tgl']
                            ));
                            //=> / END : Insert to Jurnal Posting and Update Balance
                        }
        
                        if($Data['amount_pph'] != 0 && $Data['coa_pph'] > 0){
                            $return['pembukuan_pph'] = $Data['coa_pembukuan_pph'];
                            if($Data['coa_pembukuan_pph'] == 'debit'){
                                $amount_pph = -1 * $Data['amount_pph'];
                            }
                            else{
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
                                'rate'          => 1,
                                'coa'           => $Data['coa_pph'],
                                'value'         => $amount_pph,
                                'kode'          => $Data['dp_inv_kode'],
                                'tanggal'       => $Data['ref_tgl']
                            ));
                            //=> / END : Insert to Jurnal Posting and Update Balance
                        }
        
                        if($Data['coa_uang_muka'] > 0){
                            $Jurnal = App::JurnalPosting(array(
                                'trx_type'      => 5,
                                'tipe'          => 'debit',
                                'company'       => $Data['company'],
                                'source'        => $Data['dp_inv_kode'],
                                'target'        => $Data['po_kode'],
                                'target_2'      => $Data['item'],
                                'currency'      => $Data['currency'],
                                'rate'          => 1,
                                'coa'           => $Data['coa_uang_muka'],
                                'value'         => $Data['amount_uang_muka'],
                                'kode'          => $Data['dp_inv_kode'],
                                'tanggal'       => $Data['ref_tgl']
                            ));
                            //=> / END : Insert to Jurnal Posting and Update Balance
                        }
        
                        if($Data['coa_hutang_supplier'] > 0){
                            $Jurnal = App::JurnalPosting(array(
                                'trx_type'      => 5,
                                'tipe'          => 'credit',
                                'company'       => $Data['company'],
                                'source'        => $Data['dp_inv_kode'],
                                'target'        => $Data['supplier_kode'],
                                'target_2'      => $Data['item'],
                                'currency'      => $Data['currency'],
                                'rate'          => 1,
                                'coa'           => $Data['coa_hutang_supplier'],
                                'value'         => $Data['amount_uang_muka'] + $Data['amount_ppn'] - $Data['amount_pph'],
                                'kode'          => $Data['dp_inv_kode'],
                                'tanggal'       => $Data['ref_tgl']
                            ));
                            //=> / END : Insert to Jurnal Posting and Update Balance
                        }
                        //=> / END : Posting Jurnal
                    }
                }
            }

            echo "Finish Posting Inv DP.<br/>";
        }
    
        /**
         * Trx ID = 6
         */
        function closingINV_SD($company, $year, $month){
            // $DB = new DB;
            global $DB;

            if($DB->Delete(
                "journal",
                "company = ".$company." 
                AND YEAR ( tanggal ) = ".$year." 
                AND MONTH ( tanggal ) = ".$month."
                AND DOC_ID = 6"
            )){
                $Q_AllInvSD = $DB->QueryPort("
                    SELECT
                        h.kode po_kode,
                        i.kode inv_kode,
                        i.ref_tgl,
                        i.note,
                        h.supplier_kode,
                        d.item,
                        h.currency,
                        h.company,
                    CASE
                            
                            WHEN h.currency = 'IDR' THEN
                            ( SELECT coa_accrued FROM item_coa WHERE company = hg.company AND item_id = dg.item ) 
                        END coa_accrued,
                        ( h.other_cost / ( SELECT sum( qty_po ) FROM po_detail WHERE header = h.id ) * dg.qty_receipt ) + ( ( 100- h.disc ) / 100 * ( d.price * dg.qty_receipt ) ) amount_accrued,
                    CASE
                            
                            WHEN h.currency = 'IDR' THEN
                            ( SELECT id FROM coa_master WHERE kode = '11050110' AND company = h.company ) 
                        END coa_uang_muka,
                        (
                            h.other_cost / ( SELECT sum( qty_po ) FROM po_detail WHERE header = h.id ) * ( dg.qty_receipt / 100 * h.dp ) 
                            ) + (
                            ( 100- h.disc ) / 100 * ( d.price * ( dg.qty_receipt / 100 * h.dp ) ) 
                        ) amount_uang_muka,
                    CASE
                            
                            WHEN h.ppn > 0 THEN
                            ( SELECT id FROM coa_master WHERE kode = ( SELECT coa_kode FROM taxmaster WHERE CODE = 'VAT-IN' ) AND company = h.company ) ELSE 0 
                        END coa_ppn,
                    CASE
                            
                            WHEN h.ppn > 0 THEN
                            ( SELECT pembukuan FROM taxmaster WHERE CODE = 'VAT-IN' ) ELSE 0 
                        END coa_pembukuan_ppn,
                    CASE

                            WHEN h.customs = 1 THEN
                                0 
                            ELSE (
                                ( ( ( 100- h.disc ) / 100 * ( d.price * dg.qty_receipt ) ) ) * ( h.ppn / 100 ) 
                                ) - (
                                (
                                    (
                                        ( 100- h.disc ) / 100 * ( d.price * ( dg.qty_receipt / 100 * h.dp ) ) 
                                    ) 
                                ) * ( h.ppn / 100 ) 
                            ) 
                        END amount_ppn,
                    CASE
                            
                            WHEN d.pph > 0 THEN
                            ( SELECT id FROM coa_master WHERE kode = ( SELECT coa_kode FROM taxmaster WHERE CODE = h.pph_code ) AND company = h.company ) ELSE 0 
                        END coa_pph,
                    CASE
                            
                            WHEN d.pph > 0 THEN
                            ( SELECT pembukuan FROM taxmaster WHERE CODE = h.pph_code ) ELSE 0 
                        END coa_pembukuan_pph,
                        (
                            ( ( ( 100- h.disc ) / 100 * ( d.price * dg.qty_receipt ) ) ) * ( h.pph / 100 ) 
                            ) - (
                            (
                                (
                                    ( 100- h.disc ) / 100 * ( d.price * ( dg.qty_receipt / 100 * h.dp ) ) 
                                ) 
                            ) * ( h.pph / 100 ) 
                        ) amount_pph,
                    CASE
                            
                            WHEN h.currency = 'IDR' THEN
                            ( SELECT coa FROM trx_coa_balance WHERE doc_nama = 'Purchase Invoice' and seq = 1 AND company = h.company ) 
                        END coa_hutang_supplier 
                    FROM
                        po h,
                        po_detail d,
                        gr hg,
                        gr_detail dg,
                        invoice i
                    WHERE
                        h.id = d.header 
                        AND h.id = hg.po 
                        AND hg.id = dg.header 
                        AND d.item = dg.item 
                        AND hg.inv = i.id
                        AND i.tipe = 2
                        AND i.company = ".$company."
                        AND YEAR(i.ref_tgl) = ".$year."
                        AND MONTH(i.ref_tgl) = ".$month."
                ");
        
                $R_AllInvSD = $DB->Row($Q_AllInvSD);
        
                if($R_AllInvSD > 0){
                    while($Data = $DB->Result($Q_AllInvSD)){
                        /**
                         * START : Posting Jurnal
                         */
                        
                        if($Data['coa_accrued'] > 0){
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
                                'value'         => $Data['amount_accrued'],
                                'kode'          => $Data['inv_kode'],
                                'tanggal'       => $Data['ref_tgl']
                            ));
                            //=> / END : Insert to Jurnal Posting and Update Balance
                
                            $return['jurnalPosting'][$i] = $Jurnal['msg'];
                        }
        
                        if($Data['amount_uang_muka'] > 0){
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
                                'value'         => $Data['amount_uang_muka'],
                                'kode'          => $Data['inv_kode'],
                                'tanggal'       => $Data['ref_tgl']
                            ));
                            //=> / END : Insert to Jurnal Posting and Update Balance
                
                            $return['jurnalPosting'][$i] = $Jurnal['msg'];
                        }
        
                        if($Data['amount_ppn'] > 0 && $Data['coa_ppn'] > 0){
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
                                'value'         => $Data['amount_ppn'],
                                'kode'          => $Data['inv_kode'],
                                'tanggal'       => $Data['ref_tgl']
                            ));
                            //=> / END : Insert to Jurnal Posting and Update Balance
                
                            $return['jurnalPosting'][$i] = $Jurnal['msg'];
                        }
        
                        if($Data['amount_pph'] != 0 && $Data['coa_pph'] > 0){
                            if($Data['coa_pembukuan_pph'] == 'debit'){
                                $amount_pph = -1 * $Data['amount_pph'];
                            }
                            else{
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
                
                            $return['jurnalPosting'][$i] = $Jurnal['msg'];
                        }
                        
                        if($Data['coa_hutang_supplier'] > 0 && ($Data['amount_accrued'] + $Data['amount_ppn'] - $Data['amount_uang_muka'] - $Data['amount_pph']) != 0){
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
                                'value'         => $Data['amount_accrued'] + $Data['amount_ppn'] - $Data['amount_uang_muka'] - $Data['amount_pph'],
                                'kode'          => $Data['inv_kode'],
                                'tanggal'       => $Data['ref_tgl']
                            ));
                            //=> / END : Insert to Jurnal Posting and Update Balance
                
                            $return['jurnalPosting'][$i] = $Jurnal['msg'];
                        }
                        //=> / END : Posting Jurnal
                    }
                }
            }

            echo "Finish Posting Inv SD.<br/>";
        }
    
        /**
         * Trx ID = 7
         */
        function closingJV($company, $year, $month){
            // $DB = new DB;
            global $DB;

            if($DB->Delete(
                "journal",
                "company = ".$company." 
                AND YEAR ( tanggal ) = ".$year." 
                AND MONTH ( tanggal ) = ".$month."
                AND DOC_ID = 7"
            )){
                $Q_AllJV = $DB->QueryPort("
                    SELECT
                        x.kode,
                        x.tanggal,
                        y.coa,
                        y.debit,
                        y.credit,
                        y.keterangan
                    FROM
                        jv x,
                        jv_detail y
                    WHERE
                        x.id = y.header
                        AND x.verified = 1
                        AND x.company = ".$company." 
                        AND YEAR ( x.tanggal ) = ".$year." 
                        AND MONTH ( x.tanggal ) = ".$month." 
                    ORDER BY
                        x.tanggal,
                        x.kode,
                        y.credit
                ");
        
                $R_AllJV = $DB->Row($Q_AllJV);
        
                if($R_AllJV > 0){
                    while($JV = $DB->Result($Q_AllJV)){
                        /**
                         * START : Posting Jurnal
                         */

                        if($JV['credit'] == 0){
                            $Jurnal = App::JurnalPosting(array(
                                'trx_type'      => 7,
                                'tipe'          => 'debit',
                                'company'       => $company,
                                'source'        => $JV['kode'],
                                'target'        => $JV['kode'],
                                'currency'      => 'IDR',
                                'rate'          => 1,
                                'coa'           => $JV['coa'],
                                'value'         => $JV['debit'],
                                'kode'          => $JV['kode'],
                                'tanggal'       => $JV['tanggal'],
                                'keterangan'    => $JV['keterangan']
                            ));
                    
                            //=> / END : Insert to Jurnal Posting and Update Balance
                        }
                        else if($JV['debit'] == 0){
                            $Jurnal = App::JurnalPosting(array(
                                'trx_type'      => 7,
                                'tipe'          => 'debit',
                                'company'       => $company,
                                'source'        => $JV['kode'],
                                'target'        => $JV['kode'],
                                'currency'      => 'IDR',
                                'rate'          => 1,
                                'coa'           => $JV['coa'],
                                'value'         => $JV['credit'],
                                'kode'          => $JV['kode'],
                                'tanggal'       => $JV['tanggal'],
                                'keterangan'    => $JV['keterangan']
                            ));
                    
                            //=> / END : Insert to Jurnal Posting and Update Balance
                        }
                    }
                }
            }

            echo "Finish Posting JV.<br/>";
        }
    
        /**
         * Trx ID = 8
         */
        function closingAsset($company, $year, $month){
            // $DB = new DB;
            global $DB;

            if($DB->Delete(
                "journal",
                "company = ".$company." 
                AND YEAR ( tanggal ) = ".$year." 
                AND MONTH ( tanggal ) = ".$month."
                AND DOC_ID = 8"
            )){
                $Q_AllAST = $DB->QueryPort("
                    SELECT
                        H.kode,
                        H.asset_type_nama,
                        H.acquisition_value,
                        D.id AS id_detail,
                        H.tanggal,
                        H.remarks,
                        D.coa_expenditures,
                        D.coa_kode_expenditures,
                        D.coa_nama_expenditures,
                        D.coa_asset,
                        D.coa_kode_asset,
                        D.coa_nama_asset 
                    FROM
                        ast_detail D,
                        ast H 
                    WHERE
                        H.id = D.header 
                        AND H.verified = 1
                        AND H.company = ".$company." 
                        AND YEAR ( H.tanggal ) = ".$year." 
                        AND MONTH ( H.tanggal ) = ".$month." 
                ");
        
                $R_AllAST = $DB->Row($Q_AllAST);
        
                if($R_AllAST > 0){
                    while($AST = $DB->Result($Q_AllAST)){
                        /**
                         * START : Posting Jurnal
                         */

                        $Jurnal = App::JurnalPosting(array(
                            'trx_type'      => 8,
                            'tipe'          => 'debit',
                            'company'       => $company,
                            'source'        => $AST['kode'],
                            'target'        => $AST['asset_type_nama'],
                            'currency'      => 'IDR',
                            'rate'          => 1,
                            'coa'           => $AST['coa_asset'],
                            'value'         => $AST['acquisition_value'],
                            'kode'          => $AST['kode'],
                            'tanggal'       => $AST['tanggal'],
                            'keterangan'    => $AST['remarks']
                        ));
                        //=> / END : Insert to Jurnal Posting and Update Balance
            
                        $Jurnal = App::JurnalPosting(array(
                            'trx_type'      => 8,
                            'tipe'          => 'credit',
                            'company'       => $company,
                            'source'        => $AST['kode'],
                            'target'        => $AST['asset_type_nama'],
                            'currency'      => 'IDR',
                            'rate'          => 1,
                            'coa'           => $AST['coa_expenditures'],
                            'value'         => $AST['acquisition_value'],
                            'kode'          => $AST['kode'],
                            'tanggal'       => $AST['tanggal'],
                            'keterangan'    => $AST['remarks']
                        ));
                        //=> / END : Insert to Jurnal Posting and Update Balance
                    }
                }
            }

            echo "Finish Posting Asset.<br/>";
        }
    
        /**
         * Trx ID = 9
         */
        function closingStockAdj($company, $year, $month){
            // $DB = new DB;
            global $DB;

            if($DB->Delete(
                "journal",
                "company = ".$company." 
                AND YEAR ( tanggal ) = ".$year." 
                AND MONTH ( tanggal ) = ".$month."
                AND DOC_ID = 9"
            )){
                $Q_AllSA = $DB->QueryPort("
                    SELECT
                        x.kode,
                        x.tanggal,
                        x.remarks,
                        x.storeloc_kode,
                        y.item,
                        y.jurnal_acc,
                        y.val_jurnal_acc,
                        y.coa
                    FROM
                        stock_adjustment x,
                        stock_adjustment_detail y 
                    WHERE
                        x.id = y.header
                        AND x.approved = 1
                        AND x.adj_value = 1
                        AND y.selisih_val != 0
                        AND x.company = ".$company." 
                        AND YEAR ( x.tanggal ) = ".$year." 
                        AND MONTH ( x.tanggal ) = ".$month." 
                    ORDER BY
                        x.tanggal,
                        x.kode
                ");
        
                $R_AllSA = $DB->Row($Q_AllSA);
        
                if($R_AllSA > 0){
                    while($SA = $DB->Result($Q_AllSA)){
                        /**
                         * START : Posting Jurnal
                         */

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
                                item_id = '" . $SA['item'] . "'
                                AND company = ".$company."
                            "
                        );
                        $R_COA_Item = $DB->Row($Q_COA_Item);
                        if($R_COA_Item > 0){
                            $COA_Item = $DB->Result($Q_COA_Item);

                            if($SA['jurnal_acc'] == "debit"){
                                $JurnalBiaya = "credit";
                            }
                            else{
                                $JurnalBiaya = "debit";
                            }
                                
                            $Jurnal = App::JurnalPosting(array(
                                'trx_type'      => 9,
                                'tipe'          => $SA['jurnal_acc'],
                                'company'       => $company,
                                'source'        => $SA['kode'],
                                'target'        => $SA['storeloc_kode'],
                                'target_2'      => $SA['item'],
                                'currency'      => 'IDR',
                                'rate'          => 1,
                                'coa'           => $COA_Item['coa_persediaan'],
                                'value'         => $SA['val_jurnal_acc'],
                                'kode'          => $SA['kode'],
                                'tanggal'       => $SA['tanggal'],
                                'keterangan'    => $SA['remarks']
                            ));
            
                            $Jurnal = App::JurnalPosting(array(
                                'trx_type'      => 9,
                                'tipe'          => $JurnalBiaya,
                                'company'       => $company,
                                'source'        => $SA['kode'],
                                'target'        => $SA['storeloc_kode'],
                                'target_2'      => $SA['item'],
                                'currency'      => 'IDR',
                                'rate'          => 1,
                                'coa'           => $SA['coa'],
                                'value'         => $SA['val_jurnal_acc'],
                                'kode'          => $SA['kode'],
                                'tanggal'       => $SA['tanggal'],
                                'keterangan'    => $SA['remarks']
                            ));
                        }
        
                        //=> / END : Posting Jurnal
                    }
                }
            }

            echo "Finish Posting Stock Adjustment.<br/>";
        }
    
        /**
         * Trx ID = 10
         */
        function closingActProd($company, $year, $month){
            // $DB = new DB;
            global $DB;

            if($DB->Delete(
                "journal",
                "company = ".$company." 
                AND YEAR ( tanggal ) = ".$year." 
                AND MONTH ( tanggal ) = ".$month."
                AND DOC_ID = 10"
            )){
                $Q_AllAP = $DB->QueryPort("
                    SELECT
                        x.kode,
                        x.tanggal,
                        z.storeloc_kode,
                        y.item,
                        y.qty,
                        y.price
                    FROM
                        sr x,
                        sr_detail y,
                        jo z
                    WHERE
                        x.id = y.header
                        AND x.jo = z.id
                        AND z.company = ".$company." 
                        AND YEAR ( x.tanggal ) = ".$year." 
                        AND MONTH ( x.tanggal ) = ".$month." 
                    ORDER BY
                        x.tanggal,
                        x.kode
                ");
        
                $R_AllAP = $DB->Row($Q_AllAP);
        
                if($R_AllAP > 0){
                    while($AP = $DB->Result($Q_AllAP)){
                        /**
                         * START : Posting Jurnal
                         */

                        if(($AP['price'] * $AP['qty']) != 0){
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
                                    item_id = '" . $AP['item'] . "'
                                    AND company = ".$company."
                                "
                            );
                            $R_COA_Item = $DB->Row($Q_COA_Item);
                            if($R_COA_Item > 0){
                                $COA_Item = $DB->Result($Q_COA_Item);
        
                                $Jurnal = App::JurnalPosting(array(
                                    'trx_type'      => 10,
                                    'tipe'          => 'debit',
                                    'company'       => $company,
                                    'source'        => $AP['kode'],
                                    'target'        => $AP['storeloc_kode'],
                                    'target_2'      => $AP['item'],
                                    'currency'      => 'IDR',
                                    'rate'          => 1,
                                    'coa'           => $COA_Item['coa_persediaan'],
                                    'value'         => ($AP['price'] * $AP['qty']),
                                    'kode'          => $AP['kode'],
                                    'tanggal'       => $AP['tanggal']
                                ));
        
                                $Jurnal = App::JurnalPosting(array(
                                    'trx_type'      => 10,
                                    'tipe'          => 'credit',
                                    'company'       => $company,
                                    'source'        => $AP['kode'],
                                    'target'        => $AP['storeloc_kode'],
                                    'target_2'      => $AP['item'],
                                    'currency'      => 'IDR',
                                    'rate'          => 1,
                                    'coa'           => $COA_Item['coa_hpp'],
                                    'value'         => ($AP['price'] * $AP['qty']),
                                    'kode'          => $AP['kode'],
                                    'tanggal'       => $AP['tanggal']
                                ));
                            }
                        }
                    }
                }
            }

            echo "Finish Posting Actual Production.<br/>";
        }
    
        /**
         * Trx ID = 11
         */
        function closingSP3($company, $year, $month){
            // $DB = new DB;
            global $DB;

            if($DB->Delete(
                "journal",
                "company = ".$company." 
                AND YEAR ( tanggal ) = ".$year." 
                AND MONTH ( tanggal ) = ".$month."
                AND DOC_ID = 11"
            )){
                $Q_AllSP3 = $DB->QueryPort("
                    SELECT
                        x.kode,
                        x.tanggal,
                        x.cost_center_kode,
                        x.currency,
                        y.coa,
                        y.debit,
                        y.credit,
                        x.keterangan
                    FROM
                        sp3 x,
                        sp3_jv_detail y
                    WHERE
                        x.id = y.header
                        AND x.company = ".$company." 
                        AND YEAR ( x.tanggal ) = ".$year." 
                        AND MONTH ( x.tanggal ) = ".$month." 
                    ORDER BY
                        x.tanggal,
                        x.kode,
                        y.credit
                ");
        
                $R_AllSP3 = $DB->Row($Q_AllSP3);
        
                if($R_AllSP3 > 0){
                    while($SP3 = $DB->Result($Q_AllSP3)){
                        /**
                         * START : Posting Jurnal
                         */

                        if($SP3['credit'] == 0){
                            $Jurnal = App::JurnalPosting(array(
                                'trx_type'      => 11,
                                'tipe'          => 'debit',
                                'company'       => $company,
                                'source'        => $SP3['kode'],
                                'target'        => $SP3['cost_center_kode'],
                                'currency'      => $SP3['currency'],
                                'rate'          => 1,
                                'coa'           => $SP3['coa'],
                                'value'         => $SP3['debit'],
                                'kode'          => $SP3['kode'],
                                'tanggal'       => $SP3['tanggal'],
                                'keterangan'    => $SP3['keterangan']
                            ));
                    
                            //=> / END : Insert to Jurnal Posting and Update Balance
                        }
                        else if($SP3['debit'] == 0){
                            $Jurnal = App::JurnalPosting(array(
                                'trx_type'      => 11,
                                'tipe'          => 'credit',
                                'company'       => $company,
                                'source'        => $SP3['kode'],
                                'target'        => $SP3['cost_center_kode'],
                                'currency'      => $SP3['currency'],
                                'rate'          => 1,
                                'coa'           => $SP3['coa'],
                                'value'         => $SP3['credit'],
                                'kode'          => $SP3['kode'],
                                'tanggal'       => $SP3['tanggal'],
                                'keterangan'    => $SP3['keterangan']
                            ));
                    
                            //=> / END : Insert to Jurnal Posting and Update Balance
                        }
                    }
                }
            }

            echo "Finish Posting SP3.<br/>";
        }
    
        /**
         * Trx ID = 12
         */
        function closingInitStock($company, $year, $month){
            // $DB = new DB;
            global $DB;

            if($DB->Delete(
                "journal",
                "company = ".$company." 
                AND YEAR ( tanggal ) = ".$year." 
                AND MONTH ( tanggal ) = ".$month."
                AND DOC_ID = 12"
            )){
                $Q_AllIS = $DB->QueryPort("
                    SELECT
                        x.kode,
                        x.tanggal,
                        x.description,
                        x.storeloc_kode,
                        y.item,
                        y.qty,
                        y.price
                    FROM
                        initial_stock x,
                        initial_stock_detail y 
                    WHERE
                        x.id = y.header
                        AND x.company = ".$company." 
                        AND YEAR ( x.tanggal ) = ".$year." 
                        AND MONTH ( x.tanggal ) = ".$month." 
                    ORDER BY
                        x.tanggal,
                        x.kode
                ");
        
                $R_AllIS = $DB->Row($Q_AllIS);
        
                if($R_AllIS > 0){
                    while($IS = $DB->Result($Q_AllIS)){
                        /**
                         * START : Posting Jurnal
                         */
                        
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
                                doc_nama = 'Initial Stock' and seq = 1 AND company = ".$company."
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
                                item_id = '" . $IS['item'] . "'
                                AND company = ".$company."
                            "
                        );
                        $R_COA_Item = $DB->Row($Q_COA_Item);
                        if($R_COA_Item > 0){
                            $COA_Item = $DB->Result($Q_COA_Item);
            
                            if($COA_Item['coa_persediaan']){
                                $JurnalAccounting = App::JurnalPosting(array(
                                    'trx_type'      => 12,
                                    'tipe'          => 'debit',
                                    'company'       => $company,
                                    'source'        => $IS['kode'],
                                    'target'        => $IS['storeloc_kode'],
                                    'target_2'      => $IS['item'],
                                    'currency'      => 'IDR',
                                    'rate'          => 1,
                                    'coa'           => $COA_Item['coa_persediaan'],
                                    'value'         => $IS['price'] * $IS['qty'],
                                    'kode'          => $IS['kode'],
                                    'tanggal'       => $IS['tanggal']
                                ));
            
                                $JurnalAccounting = App::JurnalPosting(array(
                                    'trx_type'      => 12,
                                    'tipe'          => 'credit',
                                    'company'       => $company,
                                    'source'        => $IS['kode'],
                                    'target'        => $IS['storeloc_kode'],
                                    'target_2'      => $IS['item'],
                                    'currency'      => 'IDR',
                                    'rate'          => 1,
                                    'coa'           => $COA_OpeningBalance['coa'],
                                    'value'         => $IS['price'] * $IS['qty'],
                                    'kode'          => $IS['kode'],
                                    'tanggal'       => $IS['tanggal']
                                ));
                            }
                        }
                        //=> / END : Posting Jurnal
                    }
                }
            }

            echo "Finish Posting Initial Stock.<br/>";
        }
    
        /**
         * Trx ID = 13
         */
        function closingBP($company, $year, $month){
            // $DB = new DB;
            global $DB;

    
        }
    
        /**
         * Trx ID = 14
         */
        function closingBR($company, $year, $month){
            // $DB = new DB;
            global $DB;

    
        }
    }

    if((isset($company) && !empty($company)) && (isset($year) && !empty($year)) && (isset($month) && !empty($month))){
        if(isset($modul) && !empty($modul)){
            switch ($modul) {
                case 1:
                    Reclosing::closingGR($company, $year, $month);
                    break;
                case 2:
                    Reclosing::closingGI($company, $year, $month);
                    break;
                case 3:
                    Reclosing::closingRGR($company, $year, $month);
                    break;
                case 4:
                    Reclosing::closingRGI($company, $year, $month);
                    break;
                case 5:
                    Reclosing::closingINV_DP($company, $year, $month);
                    break;
                case 6:
                    Reclosing::closingINV_SD($company, $year, $month);
                    break;
                case 7:
                    Reclosing::closingJV($company, $year, $month);
                    break;
                case 8:
                    Reclosing::closingAsset($company, $year, $month);
                    break;
                case 9:
                    Reclosing::closingStockAdj($company, $year, $month);
                    break;
                case 10:
                    Reclosing::closingActProd($company, $year, $month);
                    break;
                case 11:
                    Reclosing::closingSP3($company, $year, $month);
                    break;
                case 12:
                    Reclosing::closingInitStock($company, $year, $month);
                    break;
                
                default:
                    break;
            }

            Reclosing::closingBalance($company, $year, $month);
        }
        else{
            Reclosing::closingGR($company, $year, $month);
            Reclosing::closingGI($company, $year, $month);
            Reclosing::closingRGI($company, $year, $month);
            Reclosing::closingRGR($company, $year, $month);
            Reclosing::closingINV_DP($company, $year, $month);
            Reclosing::closingINV_SD($company, $year, $month);
            Reclosing::closingJV($company, $year, $month);
            Reclosing::closingAsset($company, $year, $month);
            Reclosing::closingInitStock($company, $year, $month);
            Reclosing::closingStockAdj($company, $year, $month);
            Reclosing::closingActProd($company, $year, $month);
            Reclosing::closingSP3($company, $year, $month);
            Reclosing::closingBalance($company, $year, $month);
        }
    }
    else{
        echo "Please specify parameter company, year & month for target.";
    }
?>