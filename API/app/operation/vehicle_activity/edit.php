<?php

$Modid = 137;
Perm::Check($Modid, 'edit');

$return = [];
$RPL = "";
$SENT = Core::Extract($_POST, $RPL);

/* Extract Array */
if (isset($SENT)) {
    foreach ($SENT as $KEY => $VAL) {
        $$KEY = $VAL;
    }
}

$Table = array(
    'def'   => 'vehicle_activity'
);

/**
 * History
 */
$HistoryField = array(
    'table'         => $Table['def'],
    'action'        => "edit",
    'description'   => "Edit Vehicle Activity"
);
$History = Core::History($HistoryField);
//=> END : History

$Date = date('Y-m-d H:i:s');

$DB->ManualCommit();

/*Update Data*/
if ($DB->Update(
    $Table['def'],
    array(
        'waktu_start'           => $waktu_start_send,
        'waktu_end'             => $waktu_end_send,
        'total_waktu'           => $total_waktu,
        'jarak_start'           => $jarak_start_send,
        'jarak_end'             => $jarak_end_send,
        'total_jarak'           => $total_jarak,
        'coa'                   => $coa,
        'coa_kode'              => $coa_kode,
        'coa_nama'              => $coa_nama,
        'muatan'                => $muatan,
        'muatan_abbr'           => $muatan_abbr,
        'muatan_nama'           => $muatan_nama,
        'qty'                   => $qty,
        'uom'                   => $uom,
        'keterangan'            => $keterangan,
        'update_by'             => Core::GetState('id'),
        'update_date'           => $Date,
        'history'               => $History
    ),
    "id = '" . $id . "'"
)) {
    $DB->Commit();

    $return['status'] = 1;
} else {
    $return = array(
        'status'        => 0,
        'error_msg'     => 'Gagal Mengedit Data'
    );
}

echo Core::ReturnData($return);

?>