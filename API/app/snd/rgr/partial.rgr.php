<?php

//=> Default Statement
$return = [];
$RPL    = "";
$SENT   = Core::Extract($_POST, $RPL);

//=> Extract Array
if(isset($SENT)){
    foreach($SENT as $KEY => $VAL){
        $$KEY = $VAL;
    }
}

$Table = array(
    'def'       => 'rgr',
    'detail'    => 'rgr_detail',
    'grd'       => 'gr_detail',
    'pihakke3'  => 'pihakketiga_coa'
);

$list = json_decode($list_send, true);

/**
 * Create Code
 */
$Time = date('y') . "/";
$Time2 = romawi(date('n')) . "/";
$InitialCode = "RGR/" . strtoupper($company_abbr) . "-" . strtoupper($dept_abbr) . "/" . $Time . $Time2;
$InitialCodeCheck = "RGR/" . strtoupper($company_abbr) . "%/" . $Time;
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
//=> END : Create Code

/**
 * Field
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
    'table'         => $Table['def'],
    'clause'        => "WHERE kode = '" . $kode . "'",
    'action'        => "add",
    'description'   => "Create new Return GR from (" . $gr_kode . ")"
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
    'gr'            => $gr,
    'gr_kode'       => $gr_kode,
    'po'            => $po,
    'po_kode'       => $po_kode,
    'tanggal'       => $tanggal_send,
    'supplier'      => $supplier,
    'supplier_kode' => $supplier_kode,
    'supplier_nama' => $supplier_nama,
    'return'        => 1,
    'create_by'     => Core::GetState('id'),
    'create_date'   => $Date,
    'history'       => $History,
    'status'        => 1
);

$DB->ManualCommit();

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
    
            /** Reverse Journal Accrued */
    
            if($enable_journal == 1){
                $total_price = 0;
                for($i = 0; $i < sizeof($list); $i++){
                    if(!empty($list[$i]['id']) && $list[$i]['qty_return'] != 0){
                        $total_price = $total_price + ($list[$i]['price'] * $list[$i]['qty_return']) + (($other_cost / $sum_qty_po) * $list[$i]['qty_return']) + (($ppbkb / $sum_qty_po) * $list[$i]['qty_return']);
                    }
                }

                $Jurnal = App::JurnalPosting(array(
                    'trx_type'      => 3,
                    'tipe'          => 'debit',
                    'company'       => $company,
                    'source'        => $po_kode,
                    'target'        => $supplier_kode,
                    'currency'      => $currency,
                    'rate'          => 1,
                    'coa'           => $S_COA['coa_accrued'],
                    'value'         => $total_price,
                    'kode'          => $kode,
                    'tanggal'       => $tanggal_send
                ));
                //=> / END : Insert to Jurnal Posting and Update Balance
        
                $return['detail'][$i]['jurnalPostingCredit'] = $Jurnal['msg'];
            }
    
            for($i = 0; $i < sizeof($list); $i++){
                if(!empty($list[$i]['id']) && $list[$i]['qty_return'] != 0){
                    
                    $FieldDetail = array(
                        'header'        => $Header['id'],
                        'item'          => $list[$i]['id'],
                        'qty_receipt'   => $list[$i]['qty_receipt'],
                        'act_qty_receipt' => $list[$i]['qty_max_return'],
                        'qty_return'    => $list[$i]['qty_return'],
                        'price'         => $list[$i]['price'],
                        'storeloc'      => $list[$i]['storeloc'],
                        'storeloc_kode' => $list[$i]['storeloc_kode'],
                        'storeloc_nama' => $list[$i]['storeloc_nama'],                    
                        'remarks'       => $list[$i]['remarks']
                    );
    
                    if($DB->Insert(
                        $Table['detail'],
                        $FieldDetail
                    )){
                        $return['detail'][$i] = array(
                            'status'    => 1,
                            'data'      => array(
                                'header'    => $Header['id'],
                                'item'      => $list[$i]['item']
                            )
                        );
    
                        /**
                         * Update qty_return GR
                         */
                        $CurrentReturn = $DB->Result($DB->Query(
                            $Table['grd'],
                            array(
                                'qty_return',
                                'qty_sisa'
                            ),
                            "
                                WHERE
                                    header = '" . $gr . "' AND
                                    item = '" . $list[$i]['id'] . "'
                            "
                        )); 
                        $NewReturn = ($CurrentReturn['qty_return'] + $list[$i]['qty_return']);
                        $NewSisa = ($CurrentReturn['qty_sisa'] + $list[$i]['qty_return']);
    
                        if($Q_GR = $DB->Update(
                            $Table['grd'],
                            array(
                                'qty_return'    => $NewReturn,
                                'qty_sisa'      => $NewSisa
                            ),
                            "
                                header = '" . $gr . "' AND 
                                item = '" . $list[$i]['id'] . "'
                            "
                        )){
    
                            $return['detail'][$i]['update_qty_return'] = array(
                                'status' => 1,
                                'header' => $gr,
                                'item' => $list[$i]['id']
                            );
    
                            $DB->Update(
                                "po",
                                array(
                                    'finish' => 0
                                ),
                                "
                                    id = '" . $po . "'
                                "
                            );
    
                            /**
                             * Insert to Jurnal and Update Stock
                             */
                            $Jurnal = App::JurnalStock(array(
                                'tipe'          => 'credit',
                                'company'       => $company,
                                'dept'          => $dept,
                                'storeloc'      => $list[$i]['storeloc'],
                                'item'          => $list[$i]['id'],
                                'qty'           => $list[$i]['qty_return'],
                                'price'         => $list[$i]['price'],
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
                                $R_COA_Item = $DB->Row($Q_COA_Item);
                                if($R_COA_Item > 0){
                                    $COA_Item = $DB->Result($Q_COA_Item);
        
                                    if(empty($list[$i]['remarks'])){
                                        $list[$i]['remarks'] = "-";
                                    }
            
                                    if($list[$i]['item_type']  == 1){
                                        $Jurnal = App::JurnalPosting(array(
                                            'trx_type'      => 3,
                                            'tipe'          => 'credit',
                                            'company'       => $company,
                                            'source'        => $po_kode,
                                            'target'        => $list[$i]['storeloc_kode'],
                                            'target_2'      => $list[$i]['id'],
                                            'currency'      => $currency,
                                            'rate'          => 1,
                                            'coa'           => $COA_Item['coa_persediaan'],
                                            'value'         => ($list[$i]['price'] * $list[$i]['qty_return']) + (($other_cost / $sum_qty_po) * $list[$i]['qty_return']) + (($ppbkb / $sum_qty_po) * $list[$i]['qty_return']),
                                            'kode'          => $kode,
                                            'tanggal'       => $tanggal_send,
                                            'keterangan'    => $list[$i]['remarks']
                                        ));
                                        //=> / END : Insert to Jurnal Posting and Update Balance
                    
                                        $return['detail'][$i]['jurnalPostingCredit'] = $Jurnal['msg'];
                                    }
                                    else{
                                        $Jurnal = App::JurnalPosting(array(
                                            'trx_type'      => 3,
                                            'tipe'          => 'credit',
                                            'company'       => $company,
                                            'source'        => $po_kode,
                                            'target'        => $list[$i]['storeloc_kode'],
                                            'target_2'      => $list[$i]['id'],
                                            'currency'      => $currency,
                                            'rate'          => 1,
                                            'coa'           => $COA_Item['coa_beban'],
                                            'value'         => ($list[$i]['price'] * $list[$i]['qty_return']) + (($other_cost / $sum_qty_po) * $list[$i]['qty_return']) + (($ppbkb / $sum_qty_po) * $list[$i]['qty_return']),
                                            'kode'          => $kode,
                                            'tanggal'       => $tanggal_send,
                                            'keterangan'    => $list[$i]['remarks']
                                        ));
                                        
                                        //=> / END : Insert to Jurnal Posting and Update Balance
                    
                                        $return['detail'][$i]['jurnalPostingCredit'] = $Jurnal['msg'];
                                    }
                                }
                            }
                        }
                        //=> END : Update qty_return GR$kode
                    }else{
                        $return['detail'][$i] = array(
                            'status' => 0,
                            'data' => array(
                                'header' => $Header['id'],
                                'item'  => $list[$i]['item']
                            ),
                            'error_msg' => "Failed Update Detail RGR"
                        );
                    }
                }
            }
        }
        //=> END : Insert Detail
    
        $DB->Commit();
        $return['status'] = 1;
        $return['data'] = array(
            'id'        => $Header['id'],
            'kode'      => $kode,
            'tanggal'   => date("l, jS \of F Y", strtotime($tanggal_send))
        );
    
    }else{
        $return = array(
            'status'    => 0,
            'error_msg' => 'Failed to Save RGR'
        );
    }
}
else{
    $return = array(
        'pihakketiga_coa'   => 0,
        'error_msg'         => 'Please call accounting to fill default activity/account for this supplier.'
    );
}
//=> END : Field

echo Core::ReturnData($return);
?>