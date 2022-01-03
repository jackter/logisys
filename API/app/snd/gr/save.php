<?php
$Modid = 33;

//=> Default Statement
$return = [];
$RPL	= "";
$SENT	= Core::Extract($_POST, $RPL);

//=> Extract Array
if(isset($SENT)){
    foreach($SENT as $KEY => $VAL){	
        $$KEY = $VAL;
    }
}

$Table = array(
    'def'       => 'gr',
    'detail'    => 'gr_detail',
    'po'        => 'po',
    'po_detail' => 'po_detail',
    'pihakke3'  => 'pihakketiga_coa'
);

/**
 * Clean Data
 */
$list = json_decode($list, true);

$po = $id;
$po_kode = $kode;
//=> / END : Clean Data

/**
 * Create Code
 */
$Time = date('y') . "/";
$Time2 = romawi(date('n')) . "/";
$InitialCode = "GR/" . strtoupper($company_abbr) . "-" . strtoupper($dept_abbr) . "/" . $Time . $Time2;
$InitialCodeCheck = "GR/" . strtoupper($company_abbr) . "%/" . $Time;
$Len = 4;
$LastKode = $DB->Result($DB->Query(
    $Table['def'],
    array('kode'),
    "
        WHERE
            kode LIKE '" . $InitialCodeCheck . "%' 
        ORDER BY 
            SUBSTR(kode, -$Len, $Len) DESC
    "
));
$LastKode = (int)substr($LastKode['kode'], -$Len) + 1;
$LastKode = str_pad($LastKode, $Len, 0, STR_PAD_LEFT);

$kode = $InitialCode . $LastKode;
//=> / END : Create Code

/**
 * Field
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
    'table'			=> $Table['def'],
    'clause'		=> "WHERE kode = '" . $kode . "'",
    'action'		=> "receipt",
    'description'	=> "Create new Goods Receipt (" . $kode . ")"
);
$History = Core::History($HistoryField);
$Field = array(
    'company'       => $company,
    'company_abbr'  => $company_abbr,
    'company_nama'  => $company_nama,
    'dept'          => $dept,
    'dept_abbr'     => $dept_abbr,
    'dept_nama'     => $dept_nama,
    'kode'          => $kode,
    'po'            => $po,
    'po_kode'       => $po_kode,
    'supplier'      => $supplier,
    'supplier_kode' => $supplier_kode,
    'supplier_nama' => $supplier_nama,
    'supplier_no_doc' => $supplier_no_doc,
    'tanggal'       => $tanggal_send,
    'remarks'       => CLEANHTML($remarks),
    'create_by'     => Core::GetState('id'),
    'create_date'   => $Date,
    'history'       => $History,
    'status'        => 1
);
//=> / END : Field

$DB->ManualCommit();

/**
 * Insert Data
 */
if($enable_journal == 1){
    $Q_COA = $DB->Query(
        $Table['pihakke3'],
        array(
            'id',
            'coa_accrued',
        ),
        "WHERE 
            pihakketiga_tipe = 0
            AND company = '". $company ."'
            AND pihakketiga = '". $supplier ."'
            AND coa_accrued IS NOT NULL"
    );
    $R_COA = $DB->Row($Q_COA);
}

if ($R_COA > 0 || $enable_journal != 1) {
    $S_COA = $DB->Result($Q_COA);

    if($DB->Insert(
        $Table['def'],
        $Field
    )){
    
        /**
         * Insert Detail
         */
        $Q_Header = $DB->Query(
            $Table['def'], 
            array('id'), 
            "
                WHERE
                    kode = '" . $kode . "' AND
                    create_date = '" . $Date . "'
            "
        );
        $R_Header = $DB->Row($Q_Header);
        if($R_Header > 0){
            $Header = $DB->Result($Q_Header);
    
            /**
             * Insert Detail
             */
            for($i = 0; $i < sizeof($list); $i++){
                if($list[$i]['qty_receipt'] > 0){
                    $FieldDetail = array(
                        'header'        => $Header['id'],
                        'item'          => $list[$i]['id'],
                        'qty_po'        => $list[$i]['qty_po'],
                        'qty_receipt'   => $list[$i]['qty_receipt'],
                        'qty_sisa'      => $list[$i]['outstanding'],
                        'price'         => $list[$i]['price'],
                        'unit_price'    => $list[$i]['unit_price'],
                        'storeloc'      => $list[$i]['storeloc'],
                        'storeloc_kode'      => $list[$i]['storeloc_kode'],
                        'storeloc_nama'      => $list[$i]['storeloc_nama'],
                    );
                    if($DB->Insert(
                        $Table['detail'],
                        $FieldDetail
                    )){
                        $return['detail'][$i] = array(
                                'status'    => 1,
                                'data'      => array(
                                'header'    => $Header['id'],
                                'item'      => $list[$i]['id']
                            )
                        );
    
                        /**
                         * Insert to Jurnal and Update Stock
                         */
                        $Jurnal = App::JurnalStock(array(
                            'tipe'          => 'debit',
                            'company'       => $company,
                            'dept'          => $dept,
                            'storeloc'      => $list[$i]['storeloc'],
                            'item'          => $list[$i]['id'],
                            'qty'           => $list[$i]['qty_receipt'],
                            'price'         => $list[$i]['unit_price'],
                            'kode'          => $kode,
                            'tanggal'       => $tanggal_send
                        ));
                        //=> / END : Insert to Jurnal and Update Stock
    
                        $return['detail'][$i]['jurnal'] = $Jurnal['msg'];
    
                        /**
                         * Insert to Jurnal Posting and Update Balance
                         */
    
                        /**
                        * Select Item COA
                        */
                        if($enable_journal == 1){
    
                            $Q_COA_Item = $DB->Query(
                                "item_grup_coa",
                                array(
                                    'id',
                                    'coa_persediaan',
                                    'coa_beban'
                                ),
                                "
                                WHERE 
                                    item_grup_id = '" . $list[$i]['grup'] . "'
                                    AND company = ".$company."
                                "
                            );
    
                            if($list[$i]['item_type']  == 1){
                                $R_COA_Item = $DB->Row($Q_COA_Item);
                                if($R_COA_Item > 0){
                                    $COA_Item = $DB->Result($Q_COA_Item);
                                    if($COA_Item['coa_persediaan']){
                                        $Jurnal = App::JurnalPosting(array(
                                            'trx_type'      => 1,
                                            'tipe'          => 'debit',
                                            'company'       => $company,
                                            'source'        => $po_kode,
                                            'target'        => $list[$i]['storeloc_kode'],
                                            'target_2'      => $list[$i]['id'],
                                            'currency'      => $currency,
                                            'rate'          => 1,
                                            'coa'           => $COA_Item['coa_persediaan'],
                                            'value'         => ($list[$i]['price'] * $list[$i]['qty_receipt']) + (($other_cost / $sum_qty_po) * $list[$i]['qty_receipt']) + (($ppbkb / $sum_qty_po) * $list[$i]['qty_receipt']),
                                            'kode'          => $kode,
                                            'tanggal'       => $tanggal_send,
                                            'keterangan'    => $remarks
                                        ));
                                        //=> / END : Insert to Jurnal Posting and Update Balance
                    
                                        $return['detail'][$i]['jurnalPostingDebit'] = $Jurnal['msg'];
                                    }
                                }
                            }
                            else{
                                $R_COA_Item = $DB->Row($Q_COA_Item);
                                if($R_COA_Item > 0){
                                    $COA_Item = $DB->Result($Q_COA_Item);
                                    if($COA_Item['coa_beban']){
                                        $Jurnal = App::JurnalPosting(array(
                                            'trx_type'      => 1,
                                            'tipe'          => 'debit',
                                            'company'       => $company,
                                            'source'        => $po_kode,
                                            'target'        => $list[$i]['storeloc_kode'],
                                            'target_2'      => $list[$i]['id'],
                                            'currency'      => $currency,
                                            'rate'          => 1,
                                            'coa'           => $COA_Item['coa_beban'],
                                            'value'         => ($list[$i]['price'] * $list[$i]['qty_receipt']) + (($other_cost / $sum_qty_po) * $list[$i]['qty_receipt']) + (($ppbkb / $sum_qty_po) * $list[$i]['qty_receipt']),
                                            'kode'          => $kode,
                                            'tanggal'       => $tanggal_send,
                                            'keterangan'    => $remarks
                                        ));
                                        //=> / END : Insert to Jurnal Posting and Update Balance
                    
                                        $return['detail'][$i]['jurnalPostingDebit'] = $Jurnal['msg'];
                                    }
                                }
                            }
                        }
                        //=> / END : Select Company
    
                    }else{
                        $return['detail'][$i] = array(
                            'status'    => 0,
                            'data'      => array(
                                'header'    => $Header['id'],
                                'item'      => $list[$i]['id']
                            ),
                            'error_msg' => "Failed Insert Detail GR"
                        );
                    }
    
                }
            }
    
            /**
            * Select Item COA
            */
            if($enable_journal == 1){
                $total_price = 0;
                for($i = 0; $i < sizeof($list); $i++){
                    if($list[$i]['qty_receipt'] > 0){
                        $total_price = $total_price + ($list[$i]['price'] * $list[$i]['qty_receipt']) + (($other_cost / $sum_qty_po) * $list[$i]['qty_receipt']) + (($ppbkb / $sum_qty_po) * $list[$i]['qty_receipt']);
                    }
                }

                $Jurnal = App::JurnalPosting(array(
                    'trx_type'      => 1,
                    'tipe'          => 'credit',
                    'company'       => $company,
                    'source'        => $po_kode,
                    'target'        => $supplier_kode,
                    'currency'      => $currency,
                    'rate'          => 1,
                    'coa'           => $S_COA['coa_accrued'],
                    'value'         => $total_price,
                    'kode'          => $kode,
                    'tanggal'       => $tanggal_send,
                    'keterangan'    => $remarks
                ));
            }
    
            //=> / END : Insert Detail
    
            /**
             * Finish Percent
             */
            $AllPO = $DB->Result($DB->QueryPort("
                SELECT
                    SUM(D.qty_po - D.qty_cancel) AS po
                FROM
                    po AS H,
                    po_detail AS D
                WHERE
                    H.id = '" . $po . "' AND 
                    D.header = H.id
            "));
            $AllPO = $AllPO['po'];
             
            $Q_GR = $DB->Query(
                $Table['def'],
                array(
                    'id'
                ),
                "
                    WHERE
                        po = '" . $po . "'
                "
            );
            $R_GR = $DB->Row($Q_GR);
            $AllGR = 0;
            if($R_GR > 0){
                while($GR = $DB->Result($Q_GR)){
    
                    $DGR = $DB->Result($DB->QueryPort("
                        SELECT
                            SUM(D.qty_receipt - D.qty_return) AS gr
                        FROM
                            gr AS H,
                            gr_detail AS D
                        WHERE
                            H.id = '" . $GR['id'] . "' AND 
                            D.header = H.id
                    "));
                    $AllGR += $DGR['gr'];
                }
            }
    
            if(
                $AllPO > 0 && 
                $AllGR > 0 && 
                $AllPO == $AllGR
            ){
                /**
                 * Update PO to Finish
                 */
                $DB->Update(
                    $Table['po'],
                    array(
                        'finish'        => 1,
                        'finish_date'   => $Date
                    ),
                    "id = '" . $po . "'"
                );
                //=> / END : Update PO to Finish
            }
            //=> / END : Finish Percent
        }
        //=> / END : Insert Detail
    
        $DB->Commit();
    
        $return['status'] = 1;
    
    }else{
        $return = array(
            'status'    => 0,
            'error_msg' => 'Failed to Create GR!'
        );
    }
    //=> / END : Insert Data
}
else{
    $return = array(
        'pihakketiga_coa'   => 0,
        'error_msg'         => 'Please call accounting to fill default activity/account for this supplier.'
    );
}

echo Core::ReturnData($return);
?>