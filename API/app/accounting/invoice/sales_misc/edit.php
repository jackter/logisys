<?php

$Modid = 208;
Perm::Check($Modid, 'edit');

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
    'def'       => 'sales_invoice',
    'expense'   => 'sales_invoice_expense'
);

/**
 * Field
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
    'table'         => $Table['def'],
    'clause'        => "WHERE id = '" . $id . "'",
    'action'        => "edit",
    'description'   => "Edit Sales Invoice Miscellaneous " . $kode
);
$History = Core::History($HistoryField);

$list = json_decode($list_send, true);

$Field = array(
    'pc_kode'       => $sc_kode,
    'term'          => $term,
    'cust'          => $cust,
    'cust_kode'     => $cust_kode,
    'cust_nama'     => $cust_nama,
    'cust_abbr'     => $cust_nama,
    'company_bank_id'   => $company_bank_id,
    'company_bank_nama' => $company_bank_nama,
    'company_bank'      => $company_bank,
    'company_rek'       => $company_rek,
    'inv_tgl'       => $inv_tgl_send,
    'ship_tgl'      => $ship_tgl_send,
    'currency'      => $currency,
    'amount'        => $total_amount,
    'note'          => $note,
    'update_by'     => Core::GetState('id'),
    'update_date'   => $Date,
    'history'       => $History
);
//=> / END : Field

$DB->ManualCommit();

/**
 * Update Data
 */
if ($DB->Update(
    $Table['def'],
    $Field,
    "
        id = '" . $id . "'
    "
)) {

    if ($DB->Delete(
        $Table['expense'],
        "
            header = '" . $id . "'
        "
    )) {
        for ($i = 0; $i < sizeof($list); $i++) {
            if (!empty($list[$i]['coa']) && $list[$i]['amount'] != 0) {
                $FieldDetail = array(
                    'header'        => $id,
                    'coa'           => $list[$i]['coa'],
                    'coa_nama'      => $list[$i]['coa_nama'],
                    'coa_kode'      => $list[$i]['coa_kode'],
                    'jumlah'        => $list[$i]['amount'],
                    'keterangan'    => $list[$i]['keterangan']
                );

                $DB->Insert(
                    $Table['expense'],
                    $FieldDetail
                );
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
//=> / END : Update Data

echo Core::ReturnData($return);

?>