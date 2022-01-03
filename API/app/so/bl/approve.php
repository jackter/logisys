<?php
$Modid = 198;

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
    'def'       => 'bl',
    'so'        => 'so',
    'trx_bal'       => 'trx_coa_balance',
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
	'description'	=> "Approve Bill of Lading " . $kode
);
$History = Core::History($HistoryField);

$Field = array(
    'approved'      => 1,
    'approved_by'	=> Core::GetState('id'),
	'approved_date'	=> $Date,
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
    $FieldSO = array(
        'bl'      => 1
    );

    if($DB->Update(
        $Table['so'],
        $FieldSO,
        "id = '" . $so . "'"
    )){
        $trx_bal_gainloss = $DB->Result($DB->Query(
            $Table['trx_bal'],
            array(
                'coa',
                'coa_kode',
                'coa_nama',
                'seq'
            ),
            "
                WHERE    
                    company = " . $company . "
                    AND doc_source = 'Sales'
                    AND doc_nama = 'Bill of Lading'
                    AND seq = 1
            "
        ));

        // if($inclusive_ppn == 1){
        //     $sold_price = $sold_price / 1.1;
        // }

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

            $accrued = $Sales['last_price'] * $qty_shipping;
            $cogs = $accrued;

            if($qty_bl > $qty_shipping){
                $gain = $Sales['last_price'] * ($qty_bl - $qty_shipping);
                $cogs += $gain;
            }
            else if($qty_bl < $qty_shipping){
                $loss = $Sales['last_price'] * ($qty_shipping - $qty_bl);
                $cogs -= $loss;
            }

            $Jurnal = App::JurnalPosting(array(
                'trx_type'      => 21,
                'tipe'          => 'debit',
                'company'       => $company,
                'source'        => $kontrak_kode,
                'target'        => $cust_kode,
                'item'          => $item,
                'qty'           => $qty_bl,
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
                'qty'           => $qty_bl,
                'currency'      => 'IDR',
                'rate'          => 1,
                'coa'           => $Sales['coa_accrued'],
                'value'         => $accrued,
                'kode'          => $kode,
                'tanggal'       => $tanggal_send,
                'keterangan'    => $remarks
            ));

            if($gain > 0 && $trx_bal_gainloss['coa']){
                $Jurnal = App::JurnalPosting(array(
                    'trx_type'      => 21,
                    'tipe'          => 'credit',
                    'company'       => $company,
                    'source'        => $kontrak_kode,
                    'target'        => 'Cost Book',
                    'item'          => $item,
                    'qty'           => ($qty_bl - $qty_shipping),
                    'currency'      => 'IDR',
                    'rate'          => 1,
                    'coa'           => $trx_bal_gainloss['coa'],
                    'value'         => $gain,
                    'kode'          => $kode,
                    'tanggal'       => $tanggal_send,
                    'keterangan'    => 'Gain Sales of Contract No.' . $kontrak_kode
                ));
            }
            else if ($loss > 0 && $trx_bal_gainloss['coa']){
                $Jurnal = App::JurnalPosting(array(
                    'trx_type'      => 21,
                    'tipe'          => 'debit',
                    'company'       => $company,
                    'source'        => $kontrak_kode,
                    'target'        => 'Cost Book',
                    'item'          => $item,
                    'qty'           => ($qty_shipping - $qty_bl),
                    'currency'      => 'IDR',
                    'rate'          => 1,
                    'coa'           => $trx_bal_gainloss['coa'],
                    'value'         => $loss,
                    'kode'          => $kode,
                    'tanggal'       => $tanggal_send,
                    'keterangan'    => 'Loss Sales of Contract No.' . $kontrak_kode
                ));
            }
        }

        $DB->Commit();
        $return['status'] = 1;
    }
}else{
    $return = array(
        'status'    => 0,
        'error_msg' => $GLOBALS['mysql']->error
    );
}
//=> / END: Update Verify

echo Core::ReturnData($return);
?>