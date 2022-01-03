<?php

$Modid = 69;
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
    'def'       => 'shipping',
    'sales'     => 'item_sales'
);

/**
 * Update Approve
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
    'table'         => $Table['def'],
    'clause'        => "WHERE id = '" . $id . "'",
    'action'        => "approve",
    'description'   => "Approve Shipping " . $kode
);
$History = Core::History($HistoryField);

$Field = array(
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
    $GetStock = App::GetStockItem(array(
        'company'   => $company,
        'storeloc'  => $storeloc,
        'item'      => $item
    ));

    if($qty_delivery <= $GetStock['stock']){
        $Q_Sales = $DB->Query(
            $Table['sales'],
            array(
                'coa_persediaan',
                'coa_accrued',
                'last_price'
            ),
            "
                WHERE item = '" . $item . "'
                AND company = " . $company . "
            "
        );
    
        $R_Sales = $DB->Row($Q_Sales);
        if ($R_Sales > 0) {
            $Sales = $DB->Result($Q_Sales);   
            // if($inclusive_ppn == 1){
            //     $sold_price = $sold_price / 1.1;
            // }

            /**
             * Insert to Jurnal and Update Stock
             */
            $Jurnal = App::JurnalStock(array(
                'tipe'          => 'credit',
                'company'       => $company,
                'storeloc'      => $storeloc,
                'item'          => $item,
                'qty'           => $qty_delivery,
                'price'         => $Sales['last_price'],
                'kode'          => $kode,
                'keterangan'    => CLEANHTML($remarks),
                'tanggal'       => $tanggal_send
            ));
            //=> / END : Insert to Jurnal and Update Stock

            $Jurnal = App::JurnalPosting(array(
                'trx_type'      => 20,
                'tipe'          => 'debit',
                'company'       => $company,
                'source'        => $kontrak_kode,
                'target'        => $cust_kode,
                'item'          => $item,
                'qty'           => $qty_delivery,
                'currency'      => 'IDR',
                'rate'          => 1,
                'coa'           => $Sales['coa_accrued'],
                'value'         => $Sales['last_price']  * $qty_delivery,
                'kode'          => $kode,
                'tanggal'       => $tanggal_send,
                'keterangan'    => $remarks
            ));

            $Jurnal = App::JurnalPosting(array(
                'trx_type'      => 20,
                'tipe'          => 'credit',
                'company'       => $company,
                'source'        => $kontrak_kode,
                'target'        => 'Cost Book',
                'item'          => $item,
                'qty'           => $qty_delivery,
                'currency'      => 'IDR',
                'rate'          => 1,
                'coa'           => $Sales['coa_persediaan'],
                'value'         => $Sales['last_price']  * $qty_delivery,
                'kode'          => $kode,
                'tanggal'       => $tanggal_send,
                'keterangan'    => $remarks
            ));
    
            $DB->Commit();
            $return['status'] = 1;
        }
    }
    else{
        $DB->LogError("Qty stock is not enough");
        exit();
    }
} else {
    $return = array(
        'status'    => 0,
        'error_msg' => $GLOBALS['mysql']->error
    );
}
//=> / END: Update Approve

echo Core::ReturnData($return);

?>