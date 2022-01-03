<?php

// $return = array(
//     'status' => 0,
//     'error_msg' => 'In Maintenance process.'
// );
// echo Core::ReturnData($return);
// exit();

$Modid = 61;
Perm::Check($Modid, 'approve');

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
    'def'       => 'actual_production',
    'detail'    => 'actual_production_detail',
    'item'      => 'item'
);

$detail = json_decode($detail, true);
$biaya_lain_detail = json_decode($biaya_lain_detail, true);

/**
 * Update Verify
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
    'table'         => $Table['def'],
    'clause'        => "WHERE id = '" . $id . "'",
    'action'        => "approve",
    'description'   => "Approve SR " . $kode
);
$History = Core::History($HistoryField);

$Field = array(
    'biaya_gi'      => $biaya_gi,
    'total_days'    => $total_days,
    'labour'        => $biaya_lain_detail['labour'],
    'laboratory'    => $biaya_lain_detail['laboratory'],
    'engineering'   => $biaya_lain_detail['engineering'],
    'effulent'      => $biaya_lain_detail['effulent'],
    'depreciation'  => $biaya_lain_detail['depreciation'],
    'total_biaya_lain' => $biaya_lain,

    'approved'       => 1,
    'approved_by'    => Core::GetState('id'),
    'approved_date'  => $Date,
    'update_by'      => Core::GetState('id'),
    'update_date'    => $Date,
    'history'        => $History
);
$DB->ManualCommit();

if ($DB->Update(
    $Table['def'],
    $Field,
    "id = '" . $id . "'"
)) {

    // $SR = $DB->Result($DB->Query(
    //     $Table['def'],
    //     array(
    //         'tanggal'
    //     ),
    //     "
    //         WHERE
    //             id = '" . $id . "'
    //     "
    // ));

    // /**
    //  * Detail
    //  */
    // foreach ($detail as $key => $val) {
    //     if($key == 'output'){ // Finish Goods

    //         if(sizeof($val) > 0){
    //             foreach ($val as $fg_key => $fg_val) {

    //                 if($fg_val['qty'] > 0){

    //                     /**
    //                      * Update Price
    //                      */
    //                     $DB->Update(
    //                         $Table['detail'],
    //                         array(
    //                             'price' => $fg_val['unit_price']
    //                         ),
    //                         "id = '" . $fg_val['detail_id'] . "'"
    //                     );
    //                     //=> / END : Update Price

    //                     $Jurnal = App::JurnalStock(array(
    //                         'tipe'      => 'debit',
    //                         'company'   => $company,
    //                         'dept'      => $dept,
    //                         'storeloc'  => $storeloc,
    //                         'item'      => $fg_val['id'],
    //                         'qty'       => $fg_val['qty'],
    //                         'price'     => $fg_val['unit_price'],
    //                         'kode'      => $kode,
    //                         'tanggal'   => $SR['tanggal']
    //                     ));

    //                     if(($fg_val['unit_price'] * $fg_val['qty']) != 0){
    //                         $Q_COA_Item = $DB->Query(
    //                             "item_coa",
    //                             array(
    //                                 'id', 
    //                                 'item_type',
    //                                 'coa_persediaan', 
    //                                 'coa_penjualan', 
    //                                 'coa_disc_penjualan', 
    //                                 'coa_retur_penjualan', 
    //                                 'coa_retur_pembelian', 
    //                                 'coa_hpp', 
    //                                 'coa_accrued', 
    //                                 'coa_beban'       
    //                             ),
    //                             "
    //                             WHERE 
    //                                 item_id = '" . $fg_val['id'] . "'
    //                                 AND company = ".$company."
    //                             "
    //                         );
    //                         $R_COA_Item = $DB->Row($Q_COA_Item);
    //                         if($R_COA_Item > 0){
    //                             $COA_Item = $DB->Result($Q_COA_Item);

    //                             $Jurnal = App::JurnalPosting(array(
    //                                 'trx_type'      => 10,
    //                                 'tipe'          => 'debit',
    //                                 'company'       => $company,
    //                                 'source'        => $kode,
    //                                 'target'        => $storeloc_kode,
    //                                 'target_2'      => $fg_val['id'],
    //                                 'currency'      => 'IDR',
    //                                 'rate'          => 1,
    //                                 'coa'           => $COA_Item['coa_persediaan'],
    //                                 'value'         => ($fg_val['unit_price'] * $fg_val['qty']),
    //                                 'kode'          => $kode,
    //                                 'tanggal'       => $tanggal
    //                             ));

    //                             $Jurnal = App::JurnalPosting(array(
    //                                 'trx_type'      => 10,
    //                                 'tipe'          => 'credit',
    //                                 'company'       => $company,
    //                                 'source'        => $kode,
    //                                 'target'        => $storeloc_kode,
    //                                 'target_2'      => $fg_val['id'],
    //                                 'currency'      => 'IDR',
    //                                 'rate'          => 1,
    //                                 'coa'           => $COA_Item['coa_hpp'],
    //                                 'value'         => ($fg_val['unit_price'] * $fg_val['qty']),
    //                                 'kode'          => $kode,
    //                                 'tanggal'       => $tanggal
    //                             ));
    //                         }
    //                     }

    //                 }
    //             }
    //         }
    //     }else{ // Consumptions

    //         if(sizeof($val) > 0){
    //             foreach ($val as $cs_key => $cs_val) {

    //                 if($cs_val['qty'] > 0){

    //                     if($cs_val['is_fix'] != 1){

    //                         /**
    //                          * Update Price
    //                          */
    //                         $DB->Update(
    //                             $Table['detail'],
    //                             array(
    //                                 'price' => $cs_val['price']
    //                             ),
    //                             "id = '" . $cs_val['detail_id'] . "'"
    //                         );
    //                         //=> / END : Update Price

    //                         $Jurnal = App::JurnalStock(array(
    //                             'tipe'      => 'credit',
    //                             'company'   => $company,
    //                             'dept'      => $dept,
    //                             'storeloc'  => $storeloc,
    //                             'item'      => $cs_val['id'],
    //                             'qty'       => $cs_val['qty'],
    //                             'price'     => $cs_val['price'],
    //                             'kode'      => $kode,
    //                             'tanggal'   => $SR['tanggal']
    //                         ));

    //                     }else{

    //                         /**
    //                          * Update Fix Price
    //                          */
    //                         $DB->Update(
    //                             $Table['detail'],
    //                             array(
    //                                 'price' => $cs_val['fix_price']
    //                             ),
    //                             "id = '" . $cs_val['detail_id'] . "'"
    //                         );
    //                         //=> / END : Update Fix Price

    //                     }

    //                     $Q_COA_Item = $DB->Query(
    //                         "item_coa",
    //                         array(
    //                             'id', 
    //                             'item_type',
    //                             'coa_persediaan', 
    //                             'coa_penjualan', 
    //                             'coa_disc_penjualan', 
    //                             'coa_retur_penjualan', 
    //                             'coa_retur_pembelian', 
    //                             'coa_hpp', 
    //                             'coa_accrued', 
    //                             'coa_beban'       
    //                         ),
    //                         "
    //                         WHERE 
    //                             item_id = '" . $cs_val['id'] . "'
    //                             AND company = ".$company."
    //                         "
    //                     );
    //                     $R_COA_Item = $DB->Row($Q_COA_Item);
    //                     if($R_COA_Item > 0){
    //                         $COA_Item = $DB->Result($Q_COA_Item);
    //                         if($COA_Item['coa_persediaan'] > 0){
    //                             if(($cs_val['price'] * $cs_val['qty']) != 0){
    //                                 $Jurnal = App::JurnalPosting(array(
    //                                     'trx_type'      => 10,
    //                                     'tipe'          => 'credit',
    //                                     'company'       => $company,
    //                                     'source'        => $kode,
    //                                     'target'        => $storeloc_kode,
    //                                     'target_2'      => $cs_val['id'],
    //                                     'currency'      => 'IDR',
    //                                     'rate'          => 1,
    //                                     'coa'           => $COA_Item['coa_persediaan'],
    //                                     'value'         => ($cs_val['price'] * $cs_val['qty']),
    //                                     'kode'          => $kode,
    //                                     'tanggal'       => $tanggal
    //                                 ));

    //                                 $Jurnal = App::JurnalPosting(array(
    //                                     'trx_type'      => 10,
    //                                     'tipe'          => 'debit',
    //                                     'company'       => $company,
    //                                     'source'        => $kode,
    //                                     'target'        => $storeloc_kode,
    //                                     'target_2'      => $cs_val['id'],
    //                                     'currency'      => 'IDR',
    //                                     'rate'          => 1,
    //                                     'coa'           => $COA_Item['coa_hpp'],
    //                                     'value'         => ($cs_val['price'] * $cs_val['qty']),
    //                                     'kode'          => $kode,
    //                                     'tanggal'       => $tanggal
    //                                 ));
    //                             }

    //                         }else{

    //                             if(($cs_val['fix_price'] * $cs_val['qty']) != 0){
    //                                 $COA_Hutang = $DB->Result($DB->Query(
    //                                     "coa_master",
    //                                     array(
    //                                         'id', 
    //                                         'kode', 
    //                                         'nama'       
    //                                     ),
    //                                     "
    //                                     WHERE 
    //                                         kode = '21030090'
    //                                         and company = ".$company."
    //                                     "
    //                                 ));

    //                                 $Jurnal = App::JurnalPosting(array(
    //                                     'trx_type'      => 10,
    //                                     'tipe'          => 'credit',
    //                                     'company'       => $company,
    //                                     'source'        => $kode,
    //                                     'target'        => $storeloc_kode,
    //                                     'target_2'      => $cs_val['id'],
    //                                     'currency'      => 'IDR',
    //                                     'rate'          => 1,
    //                                     'coa'           => $COA_Hutang['id'],
    //                                     'value'         => ($cs_val['fix_price'] * $cs_val['qty']),
    //                                     'kode'          => $kode,
    //                                     'tanggal'       => $tanggal
    //                                 ));

    //                                 $Jurnal = App::JurnalPosting(array(
    //                                     'trx_type'      => 10,
    //                                     'tipe'          => 'debit',
    //                                     'company'       => $company,
    //                                     'source'        => $kode,
    //                                     'target'        => $storeloc_kode,
    //                                     'target_2'      => $cs_val['id'],
    //                                     'currency'      => 'IDR',
    //                                     'rate'          => 1,
    //                                     'coa'           => $COA_Item['coa_beban'],
    //                                     'value'         => ($cs_val['fix_price'] * $cs_val['qty']),
    //                                     'kode'          => $kode,
    //                                     'tanggal'       => $tanggal
    //                                 ));
    //                             }
    //                         }
    //                     }

    //                 }

    //             }
    //         }

    //     }
    // }
    // //=> / END : Detail

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
