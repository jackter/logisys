<?php
$Modid = 73;

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
    'def'           => 'sales_invoice',
    'tax'           => 'taxmaster',
    'trx_bal'       => 'trx_coa_balance',
    'pihak_ketiga'  => 'pihakketiga_coa',
    'exchange'      => 'exchange',
    'param'         => 'parameter'
);

/**
 * Update Verify
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
    'table'         => $Table['def'],
    'clause'        => "WHERE id = '" . $id . "'",
    'action'        => "verify",
    'description'   => "Verify Sales Invoice Down Payment " . $kode
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
    // $Q_Data = $DB->QueryPort("
    //     SELECT
    //         I.id,
    //         I.sc,
    //         I.sc_kode,
    //         I.company,
    //         I.company_abbr,
    //         I.company_nama,
    //         I.cust,
    //         I.cust_kode,
    //         I.cust_nama,
    //         I.cust_abbr,
    //         I.inv_tgl,
    //         I.kode,
    //         I.currency,
    //         K.dp,
    //         K.ppn,
    //         K.inclusive_ppn,
    //         K.sold_price,
    //         K.grand_total,
    //         K.qty,
    //         K.item,
    //         K.item_kode,
    //         K.item_nama,
    //         K.item_satuan
    //     FROM
    //         sales_invoice AS I,
    //         kontrak AS K 
    //     WHERE
    //         I.id = '" . $id . "' 
    //         AND I.sc = K.id
    // ");
    // $R_Data = $DB->Row($Q_Data);

    // if ($R_Data > 0) {

    //     $Data = $DB->Result($Q_Data);
    //     if($Data['ppn']){
    //         $tax = $DB->Result($DB->Query(
    //             $Table['tax'],
    //             array(
    //                 'pembukuan',
    //                 'coa',
    //                 'coa_kode',
    //                 'coa_nama'
    //             ),
    //             "
    //                 WHERE    
    //                     company = " . $Data['company'] . "
    //                     AND code = 'VAT-OUT'
    //             "
    //         ));
    //     }

    //     $trx_bal = $DB->Result($DB->Query(
    //         $Table['trx_bal'],
    //         array(
    //             'coa',
    //             'coa_kode',
    //             'coa_nama',
    //             'seq'
    //         ),
    //         "
    //             WHERE    
    //                 company = " . $Data['company'] . "
    //                 AND doc_source = 'Finance & Accounting'
    //                 AND doc_nama = 'Sales Inv. DP'
    //                 AND seq = 1
    //         "
    //     ));

    //     $pihak_ketiga = $DB->Result($DB->Query(
    //         $Table['pihak_ketiga'],
    //         array(
    //             'coa',
    //             'coa_accrued',
    //         ),
    //         "
    //             WHERE    
    //                 company = " . $Data['company'] . "
    //                 AND pihakketiga_tipe = 2
    //                 AND pihakketiga = " . $Data['cust'] . "
    //         "
    //     ));

    //     if($Data['inclusive_ppn'] == 1){
    //         $Data['price'] = $Data['sold_price'] / 1.1;
    //     }
    //     else{
    //         $Data['price'] = $Data['sold_price'];
    //     }

    //     $accrued = 0;
    //     $ppn_amount = 0;
    //     $gt = 0;

    //     if($Data['ppn'] == 10 && $Data['inclusive_ppn'] == 1){
    //         $accrued = (($Data['sold_price'] * $Data['qty']) / 1.1);
    //         $ppn_amount = ($Data['sold_price'] * $Data['qty']) - (($Data['sold_price'] * $Data['qty']) / 1.1);
    //         $gt = $accrued + $ppn_amount;
    //     }
    //     else if($Data['ppn'] == 10 && $Data['inclusive_ppn'] == 0){
    //         $accrued = $Data['sold_price'] * $Data['qty'];
    //         $ppn_amount = ($Data['sold_price'] * $Data['qty']) / 100 * 10;
    //         $gt = $accrued + $ppn_amount;
    //     }
    //     else{
    //         $accrued = $Data['sold_price'] * $Data['qty'];
    //         $gt = $accrued;
    //     }

    //     $accrued = $accrued / 100 * $Data['dp'];
    //     $ppn_amount = $ppn_amount / 100 * $Data['dp'];
    //     $gt = $gt / 100 * $Data['dp'];
        
    //     $rate = 1;
        
    //     if($Data['currency'] != "IDR"){
    //         $R_Exchange_Ext = $DB->Row($DB->Query(
    //             $Table['param'],
    //             array(
    //                 'param_val'
    //             ),
    //             "
    //                 WHERE    
    //                     id = 'exchange_execution'
    //                     AND '" . $Data['inv_tgl'] . "' <= param_val
    //             "
    //         ));

    //         if($R_Exchange_Ext > 0){
    //             $exchange = $DB->Result($DB->Query(
    //                 $Table['exchange'],
    //                 array(
    //                     'rate'
    //                 ),
    //                 "
    //                     WHERE    
    //                         tanggal <= '" . $Data['inv_tgl'] . "' 
    //                         AND cur_kode = '" . $Data['currency'] . "'
    //                     ORDER BY tanggal desc 
    //                     LIMIT 1
    //                 "
    //             ));

    //             $rate = $exchange['rate'];
    //         }

    //         else{
    //             $DB->LogError("Exchange rate is not defined");
    //             exit();
    //         }
    //     }
        
    //     if($trx_bal['coa'] && $pihak_ketiga['coa']){
    //         if($pihak_ketiga['coa'] && $gt > 0){
    //             $Jurnal = App::JurnalPosting(array(
    //                 'trx_type'      => 18,
    //                 'tipe'          => 'debit',
    //                 'company'       => $Data['company'],
    //                 'source'        => $Data['kode'],
    //                 'target'        => $Data['cust_kode'],
    //                 'target_2'      => $Data['item'],
    //                 'currency'      => $Data['currency'],
    //                 'rate'          => $rate,
    //                 'coa'           => $pihak_ketiga['coa'],
    //                 'value'         => $gt * $rate,
    //                 'kode'          => $Data['kode'],
    //                 'tanggal'       => $Data['inv_tgl'],
    //                 'keterangan'    => "Inv Down Payment Contract No " . $Data['sc_kode'] . " a/n " . $Data['cust_nama']
    //             ));
    //         }

    //         if($Data['ppn'] == 10 && $ppn_amount > 0){
    //             $Jurnal = App::JurnalPosting(array(
    //                 'trx_type'      => 18,
    //                 'tipe'          => 'credit',
    //                 'company'       => $Data['company'],
    //                 'source'        => $Data['kode'],
    //                 'target'        => 'Cost Book',
    //                 'target_2'      => $Data['item'],
    //                 'currency'      => $Data['currency'],
    //                 'rate'          => $rate,
    //                 'coa'           => $tax['coa'],
    //                 'value'         => $ppn_amount * $rate,
    //                 'kode'          => $Data['kode'],
    //                 'tanggal'       => $Data['inv_tgl'],
    //                 'keterangan'    => "VAT Out Contract No " . $Data['sc_kode']
    //             ));
    //         }

    //         if($accrued > 0){
    //             $Jurnal = App::JurnalPosting(array(
    //                 'trx_type'      => 18,
    //                 'tipe'          => 'credit',
    //                 'company'       => $Data['company'],
    //                 'source'        => $Data['kode'],
    //                 'target'        => $Data['cust_kode'],
    //                 'target_2'      => $Data['item'],
    //                 'currency'      => $Data['currency'],
    //                 'rate'          => $rate,
    //                 'coa'           => $trx_bal['coa'],
    //                 'value'         => $accrued * $rate,
    //                 'kode'          => $Data['kode'],
    //                 'tanggal'       => $Data['inv_tgl'],
    //                 'keterangan'    => "Inv Down Payment Contract No " . $Data['sc_kode']
    //             ));
    //         }
    //     }
    //     else{
    //         $DB->LogError("Account customer is not defined");
    //         exit();
    //     }
    // }

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