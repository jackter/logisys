<?php
$Modid = 72;

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
    'bl'            => 'bl',
    'sh'            => 'sales_handover',
    'tax'           => 'taxmaster',
    'trx_bal'       => 'trx_coa_balance',
    'pihak_ketiga'  => 'pihakketiga_coa',
    'exchange'      => 'exchange',
    'param'         => 'parameter',
    'sales'         => 'item_sales'
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
    $Q_Data = $DB->QueryPort("
        SELECT
            I.id,
            I.sc,
            I.sc_kode,
            I.kode,
            I.company,
            I.company_abbr,
            I.company_nama,
            I.cust,
            I.cust_kode,
            I.cust_nama,
            I.cust_abbr,
            I.inv_tgl,
            I.tipe,
            I.verified,
            K.currency,
            K.dp,
            K.ppn,
            K.inclusive_ppn,
            K.sold_price,
            K.grand_total,
            K.qty,
            K.item,
            K.item_kode,
            K.item_nama,
            K.item_satuan ,
            K.tanggal AS sc_tgl,
            K.transport
        FROM
            sales_invoice AS I,
            kontrak AS K
        WHERE
            I.id = '" . $id . "' 
            AND I.sc = K.id
    ");
    $R_Data = $DB->Row($Q_Data);

    if ($R_Data > 0) {

        while ($Data = $DB->Result($Q_Data)) {
            if($Data['transport'] == 0){
                $BL = $DB->Result($DB->Query(
                    $Table['bl'],
                    array(
                        'id',
                        'kode',
                        'item',
                        'item_kode',
                        'item_nama' => 'nama',
                        'item_satuan' => 'satuan',
                        'qty_bl' => 'qty'
                    ),
                    "
                        WHERE
                            kontrak = " . $Data['sc'] . "
                    "
                ));

                $BL['price'] = $Data['sold_price'];
            }
            else{
                $BL = $DB->Result($DB->Query(
                    $Table['sh'],
                    array(
                        'id',
                        'kode',
                        'item',
                        'item_kode',
                        'item_nama' => 'nama',
                        'item_satuan' => 'satuan',
                        'qty_total' => 'qty'
                    ),
                    "
                        WHERE
                            kontrak = " . $Data['sc'] . "
                    "
                ));

                $BL['price'] = $Data['sold_price'];
            }

            if($Data['ppn']){
                $tax = $DB->Result($DB->Query(
                    $Table['tax'],
                    array(
                        'pembukuan',
                        'coa',
                        'coa_kode',
                        'coa_nama'
                    ),
                    "
                        WHERE    
                            company = " . $Data['company'] . "
                            AND code = 'VAT-OUT'
                    "
                ));
            }
    
            $trx_bal = $DB->Result($DB->Query(
                $Table['trx_bal'],
                array(
                    'coa',
                    'coa_kode',
                    'coa_nama',
                    'seq'
                ),
                "
                    WHERE    
                        company = " . $Data['company'] . "
                        AND doc_source = 'Finance & Accounting'
                        AND doc_nama = 'Sales Inv'
                        AND seq = 1
                "
            ));
    
            $pihak_ketiga = $DB->Result($DB->Query(
                $Table['pihak_ketiga'],
                array(
                    'coa',
                    'coa_accrued',
                ),
                "
                    WHERE    
                        company = " . $Data['company'] . "
                        AND pihakketiga_tipe = 2
                        AND pihakketiga = " . $Data['cust'] . "
                "
            ));

            $sales = $DB->Result($DB->Query(
                $Table['sales'],
                array(
                    'coa_penjualan'
                ),
                "
                    WHERE item = '" . $item . "'
                    AND company = " . $company . "
                "
            ));

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
                            AND '" . $Data['inv_tgl'] . "' <= param_val
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
                                tanggal <= '" . $Data['inv_tgl'] . "' 
                                AND cur_kode = '" . $Data['currency'] . "'
                            ORDER BY tanggal desc 
                            LIMIT 1
                        "
                    ));

                    $rate = $exchange['rate'];
                }
                else{
                    $DB->LogError("Exchange rate is not defined at " . $Data['inv_tgl'] . " for " . $Data['currency']);
                    exit();
                }
            }

            $piutang_amt = 0;
            $dp_amt = 0;
            $sales_amt = 0;
            $ppn_amt = 0;
            $subtotal = 0;

            if($inclusive_ppn == 1){
                $dp_amt = (($sold_price * $qty) / 1.1) / 100 * $dp;
            }
            else{
                $dp_amt = ($sold_price * $qty) / 100 * $dp;
            }

            if($inclusive_ppn == 1){
                $subtotal = $BL['qty'] * ($BL['price'] / 1.1);
            }
            else{
                $subtotal = $BL['qty'] * $BL['price'];
            }

            $sales_amt = $subtotal;

            $piutang_amt = $subtotal - $dp_amt;

            $ppn_amt = $piutang_amt * $ppn / 100;

            if($pihak_ketiga['coa'] && $piutang_amt > 0){
                $Jurnal = App::JurnalPosting(array(
                    'trx_type'      => 19,
                    'tipe'          => 'debit',
                    'company'       => $Data['company'],
                    'source'        => $Data['kode'],
                    'target'        => $Data['cust_kode'],
                    'item'          => $Data['item'],
                    'qty'           => $BL['qty'],
                    'currency'      => $Data['currency'],
                    'rate'          => $rate,
                    'coa'           => $pihak_ketiga['coa'],
                    'value'         => $piutang_amt + $ppn_amt,
                    'kode'          => $Data['kode'],
                    'tanggal'       => $Data['inv_tgl'],
                    'keterangan'    => "Sales Invoice Contract No " . $Data['sc_kode'] . " a/n " . $Data['cust_nama']
                ));
            }

            if($trx_bal['coa'] && $dp_amt > 0){
                $Jurnal = App::JurnalPosting(array(
                    'trx_type'      => 19,
                    'tipe'          => 'debit',
                    'company'       => $Data['company'],
                    'source'        => $Data['kode'],
                    'target'        => $Data['cust_kode'],
                    'item'          => $Data['item'],
                    'qty'           => $BL['qty'],
                    'currency'      => $Data['currency'],
                    'rate'          => $rate,
                    'coa'           => $trx_bal['coa'],
                    'value'         => $dp_amt,
                    'kode'          => $Data['kode'],
                    'tanggal'       => $Data['inv_tgl'],
                    'keterangan'    => "Inv Down Payment Contract No " . $Data['sc_kode']
                ));
            }

            if($sales['coa_penjualan'] && $sales_amt > 0){
                $Jurnal = App::JurnalPosting(array(
                    'trx_type'      => 19,
                    'tipe'          => 'credit',
                    'company'       => $Data['company'],
                    'source'        => $Data['kode'],
                    'target'        => $Data['cust_kode'],
                    'item'          => $Data['item'],
                    'qty'           => $BL['qty'],
                    'currency'      => $Data['currency'],
                    'rate'          => $rate,
                    'coa'           => $sales['coa_penjualan'],
                    'value'         => $sales_amt,
                    'kode'          => $Data['kode'],
                    'tanggal'       => $Data['inv_tgl'],
                    'keterangan'    => "Sales Contract No " . $Data['sc_kode']
                ));
            }

            if($Data['ppn'] == 10 && $tax['coa'] && $ppn_amt > 0){
                $Jurnal = App::JurnalPosting(array(
                    'trx_type'      => 19,
                    'tipe'          => 'credit',
                    'company'       => $Data['company'],
                    'source'        => $Data['kode'],
                    'target'        => 'Cost Book',
                    'item'          => $Data['item'],
                    'qty'           => $BL['qty'],
                    'currency'      => $Data['currency'],
                    'rate'          => $rate,
                    'coa'           => $tax['coa'],
                    'value'         => round($ppn_amt, 0),
                    'kode'          => $Data['kode'],
                    'tanggal'       => $Data['inv_tgl'],
                    'keterangan'    => "VAT Out Contract No " . $Data['sc_kode']
                ));
            }

        }

    }
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