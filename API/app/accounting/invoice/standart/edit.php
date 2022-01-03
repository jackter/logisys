<?php

$Modid = 47;
Perm::Check($Modid, 'edit');

//=> Default Statement
$return = [];
$RPL    = "";
$SENT    = Core::Extract($_POST, $RPL);

//=> Extract Array
if (isset($SENT)) {
    foreach ($SENT as $KEY => $VAL) {
        $$KEY = $VAL;
    }
}

$Table = array(
    'def'       => 'invoice',
    'detail'    => 'invoice_expense',
    'gr'        => 'gr',
);

$list = json_decode($list_send, true);
$list_exp = json_decode($list_exp_send, true);

/**
 * format data 
 */
$GRNID = [];
$format_grn = $COMMA = "";
foreach ($list as $Key => $Val) {
    $format_grn .= $COMMA . $Val['grn'];
    $COMMA = ",";
}
// => end format data


/**
 * Field
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
    'table'         => $Table['def'],
    'clause'        => "WHERE id = '" . $id . "'",
    'action'        => "edit",
    'description'   => "Edit Inovoice"
);
$History = Core::History($HistoryField);

$Field = array(
    'inv_tgl'       => $tanggal_inv_send,
    'ref_kode'      => $ref_kode,
    'ref_tgl'       => $tanggal_ref_send,
    'pajak_no'      => $pajak_no,
    'pajak_tgl'     => $tanggal_tax_send,
    'grn_id'        => $format_grn,
    'note'          => $note,
    'tax_base'      => $tax_baseTotal - $DP_TaxBase,
    'ppn_amount'    => $ppnTotal - $DP_PPN,
    'pph_amount'    => $pphTotal - $DP_PPh,
    'exp_amount'    => $totalExpAmount,
    'amount'        => $GTAmount,
    'tgl_jatuh_tempo' => $tgl_jatuh_tempo_send,
    'update_by'     => Core::GetState('id'),
    'update_date'   => $Date,
    'history'       => $History
);
//=> / END : Field

$DB->ManualCommit();

/**
 * Insert Data
 */

if ($DB->Update(
    $Table['def'],
    $Field,
    "
        id = '" . $id . "'
    "
)) {
    $INV = $DB->Result($DB->Query(
        $Table['def'],
        array(
            'id',
            'kode',
            'grn_id'
        ),
        "
            WHERE
                id = '" . $id . "'
        "
    ));

    /**
     * Update Status in GRN
     */
    $DB->Update(
        $Table['gr'],
        array(
            'inv'       => 0,
            'inv_kode'  => ''
        ),
        "
            inv = " . $INV['id'] . "
        "
    );
    
    $DB->Update(
        $Table['gr'],
        array(
            'inv'       => $INV['id'],
            'inv_kode'  => $INV['kode']
        ),
        "
            id IN (" . $INV['grn_id'] . ")
        "
    );
    // => End : Update status GRN

    /**
     * Update Expense
     */
    if(!empty($list_exp)){
        if($DB->Delete(
            $Table['detail'],
            "
                header = '" . $id. "'
            "
        )){
            
            for ($i = 0; $i < sizeof($list_exp); $i++) {
                if ($list_exp[$i]['coa'] > 0 && $list_exp[$i]['amount'] != 0) {
                    $FieldDetail = array(
                        'header'    => $id,
                        'coa'       => $list_exp[$i]['coa'],
                        'coa_kode'  => $list_exp[$i]['kode'],
                        'coa_nama'  => $list_exp[$i]['nama'],
                        'jumlah'    => $list_exp[$i]['amount'],
                        'keterangan'    => $list_exp[$i]['notes']
                    );

                    $DB->Insert(
                        $Table['detail'],
                        $FieldDetail
                    );
                }
            }
        }
    }   
    // => End : Update Expense

    $DB->Commit();
    $return['status'] = 1;
} else {
    $return = array(
        'status'    => 0,
        'error_msg' => $GLOBALS['mysql']->error
    );
}
//>> End: Insert Data

echo Core::ReturnData($return);

?>