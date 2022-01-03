<?php

$Modid = 137;
Perm::Check($Modid, 'add');

/* Default Statement */
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
    'def' => 'vehicle_activity'
);

/**
 * History
 */
$HistoryField = array(
    'table'         => $Table['def'],
    'action'        => "add",
    'description'   => "Add New Vehicle Activity"
);
$History = Core::History($HistoryField);
//=> END : History

$Date = date('Y-m-d H:i:s');

$Fields = array(
    'tanggal'               => $tanggal_send,
    'company'               => $company,
    'company_abbr'          => $company_abbr,
    'company_nama'          => $company_nama,
    'vehicle'               => $vehicle,
    'vgrup'                 => $vgrup,
    'vgrup_abbr'            => $vgrup_abbr,
    'vgrup_nama'            => $vgrup_nama,
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
    'create_by'             => Core::GetState('id'),
    'create_date'           => $Date,
    'history'               => $History,
    'status'                => 1
);
$DB->ManualCommit();

/*Insert Data*/
if ($DB->Insert(
    $Table['def'],
    $Fields
)) {
    $DB->Commit();

    $return['status'] = 1;
} else {
    $return = array(
        'status'    => 0,
        'error_msg' => 'Gagal Menyimpan Data'
    );
}

echo Core::ReturnData($return);

?>