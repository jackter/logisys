<?php

$Modid = 200;
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
    'def'       => 'sales_handover',
    'so'        => 'so',
    'sales'     => 'item_sales'
);

/**
 * Update Verify
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
	'table'			=> $Table['def'],
	'clause'		=> "WHERE id = '" . $id . "'",
	'action'		=> "approve",
	'description'	=> "Approve Sales Handover " . $kode
);
$History = Core::History($HistoryField);

$Field = array(
    'approved'      => 1,
    'approved_by'	=> Core::GetState('id'),
	'approved_date'	=> $Date,
	'history'		=> $History
);

$DB->ManualCommit();

if ($DB->Update(
    $Table['def'],
    $Field,
    "id = '" . $id . "'"
)) {
    $FieldSO = array(
        'sh'      => 1
    );

    if($DB->Update(
        $Table['so'],
        $FieldSO,
        "id = '" . $so . "'"
    )){
        $Q_Sales = $DB->Query(
            $Table['sales'],
            array(
                'coa_accrued',
                'coa_cogs',
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
    
            $accrued = $Sales['last_price'] * $qty_total;
            $cogs = $accrued;
    
            $Jurnal = App::JurnalPosting(array(
                'trx_type'      => 21,
                'tipe'          => 'debit',
                'company'       => $company,
                'source'        => $kontrak_kode,
                'target'        => $cust_kode,
                'item'          => $item,
                'qty'           => $qty_total,
                'currency'      => 'IDR',
                'rate'          => 1,
                'coa'           => $Sales['coa_cogs'],
                'value'         => $cogs,
                'kode'          => $kode,
                'tanggal'       => $tanggal_send,
                'keterangan'    => $remarks
            ));
    
            $Jurnal = App::JurnalPosting(array(
                'trx_type'      => 21,
                'tipe'          => 'credit',
                'company'       => $company,
                'source'        => $kontrak_kode,
                'target'        => 'Cost Book',
                'item'          => $item,
                'qty'           => $qty_total,
                'currency'      => 'IDR',
                'rate'          => 1,
                'coa'           => $Sales['coa_accrued'],
                'value'         => $accrued,
                'kode'          => $kode,
                'tanggal'       => $tanggal_send,
                'keterangan'    => $remarks
            ));
        }
    
        $DB->Commit();
        $return['status'] = 1;
    }
} else {
    $return = array(
        'status'    => 0,
        'error_msg' => $GLOBALS['mysql']->error
    );
}
//=> / END: Update Verify

echo Core::ReturnData($return);

?>