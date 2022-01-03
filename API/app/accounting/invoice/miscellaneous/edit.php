<?php

$Modid = 202;
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
    'def'       => 'invoice',
    'expense'   => 'invoice_expense'
);

/**
 * Field
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
    'table'         => $Table['def'],
    'clause'        => "WHERE id = '" . $id . "'",
    'action'        => "edit",
    'description'   => "Edit Invoice Miscellaneous " . $kode
);
$History = Core::History($HistoryField);

$list = json_decode($list_send, true);

$Field = array(
    'inv_tgl'       => $tanggal_inv_send,
    'ref_kode'      => $ref_kode,
    'ref_tgl'       => $ref_tgl_send,
    'pajak_no'      => $pajak_no,
    'pajak_tgl'     => $pajak_tgl_send,
    'amount'        => $total_amount,
    'jurnal_post'   => $jurnal_post,
    'tgl_jatuh_tempo' => $tgl_jatuh_tempo_send,
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