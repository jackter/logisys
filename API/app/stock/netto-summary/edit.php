<?php

$Modid = 189;
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
    'def'       => 'netto_summary'
);

/**
 * Field
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
    'table'         => $Table['def'],
    'clause'        => "WHERE id = '" . $id . "'",
    'action'        => "edit",
    'description'   => "Edit Netto Summary"
);
$History = Core::History($HistoryField);
$Field = array(
    'tanggal'           => $tanggal_send,
    'tiket_start'       => $tiket_start,
    'tiket_start_kode'  => $tiket_start_kode,
    'tiket_end'         => $tiket_end,
    'tiket_end_kode'    => $tiket_end_kode,
    'item'              => $item,
    'item_kode'         => $item_kode,
    'item_nama'         => $item_nama,
    'item_satuan'       => $item_satuan,
    'total_netto'       => $total_netto,
    'update_by'         => Core::GetState('id'),
    'update_date'       => $Date,
    'history'           => $History
);
//=> / END : Field
$DB->ManualCommit();

/**
 * Update Data
 */
if ($DB->Update(
    $Table['def'],
    $Field,
    "id = '" . $id . "'"
)) {
    $DB->Commit();

    $return['status'] = 1;
}
//=> / END : Update Data

echo Core::ReturnData($return);

?>