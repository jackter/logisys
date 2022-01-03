<?php

$Modid = 138;
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

$mechanic = json_decode($list_mechanic, true);
$overtime = json_decode($list_overtime, true);
$aditional = json_decode($list_aditional, true);

$Table = array(
    'def'           => 'wo',
    'wo_mechanic'   => 'wo_mechanic',
    'wo_overtime'   => 'wo_overtime',
    'wo_material'   => 'wo_material'

);

$Date = date('Y-m-d H:i:s');

$HistoryField = array(
    'table'         => $Table['def'],
    'action'        => "edit",
    'description'   => "Create Work Order"
);
$History = Core::History($HistoryField);

$Fields = array(
    'dept_section_abbr' => $dept_section_abbr,
    'dept_section_nama' => $dept_section_nama,
    'lokasi'            => $lokasi,
    'lokasi_nama'       => $lokasi_nama,
    'shift'             => $shift,
    'section'           => $section,
    'equipment'         => $equipment,
    'equipment_kode'    => $equipment_kode,
    'maintenance_type'  => $maintenance_type,
    'running_hours'     => $running_hours,
    'job_title'         => $job_title,
    'job_explan'        => $job_explan,
    'comment'           => $comment,
    'gm_approve'        => $gm_approve,
    // 'processed'         => 1,
    // 'processed_by'      => Core::GetState('id'),
    // 'processed_date'    => $Date,
    'update_by'         => Core::GetState('id'),
    'update_date'       => $Date,
    'history'           => $History
);

$DB->ManualCommit();

if ($DB->Update(
    $Table['def'],
    $Fields,
    "id = '" . $id . "'"
)) {

    $DB->Delete(
        $Table['wo_overtime'],
        "header = '" . $id . "'"
    );

    $DB->Delete(
        $Table['wo_mechanic'],
        "header = '" . $id . "'"
    );

    $DB->Delete(
        $Table['wo_material'],
        "header = '" . $id . "' AND aditional = 1"
    );

    // for ($i = 0; $i < sizeof($material); $i++) {
    //     if (!empty($material[$i]['item'])) {

    //         $FieldsMaterial = array(
    //             'header'            => $id,
    //             'item'              => $material[$i]['item'],
    //             'item_kode'         => $material[$i]['item_kode'],
    //             'item_nama'         => $material[$i]['item_nama'],
    //             'qty'               => $material[$i]['qty'],
    //             'satuan'            => $material[$i]['satuan'],
    //             'keterangan'        => $material[$i]['keterangan']
    //         );

    //         if ($DB->Insert(
    //             $Table['wo_material'],
    //             $FieldsMaterial
    //         )) {

    //             $return['status_detail'][$i] = array(
    //                 'index' => $i,
    //                 'status' => 1
    //             );
    //         }
    //     }
    // }

    // for ($i = 0; $i < sizeof($mechanic); $i++) {
    //     if (!empty($mechanic[$i]['nama'])) {

    //         $FieldsMechanic = array(
    //             'header'        => $id,
    //             'kid'           => $mechanic[$i]['kid'],
    //             'nik'           => $mechanic[$i]['nik'],
    //             'nama'          => $mechanic[$i]['nama'],
    //             'man_days'      => $mechanic[$i]['man_days'],
    //             'est_hours'     => $mechanic[$i]['est_hours'],
    //             'level'         => $mechanic[$i]['level'],
    //             'remarks'       => $mechanic[$i]['remarks']
    //         );

    //         if ($DB->Insert(
    //             $Table['wo_mechanic'],
    //             $FieldsMechanic
    //         )) {

    //             $return['status_detail'][$i] = array(
    //                 'index' => $i,
    //                 'status' => 1
    //             );
    //         }
    //     }
    // }

    // for ($i = 0; $i < sizeof($overtime); $i++) {
    //     if (!empty($overtime[$i]['nama'])) {

    //         $FieldsOvertime = array(
    //             'header'        => $id,
    //             'kid'           => $overtime[$i]['kid'],
    //             'nik'           => $overtime[$i]['nik'],
    //             'nama'          => $overtime[$i]['nama'],
    //             'level'         => $overtime[$i]['level'],
    //             'over_date'     => $overtime[$i]['over_date'],
    //             'start_time'    => $overtime[$i]['start_format'],
    //             'end_time'      => $overtime[$i]['end_format'],
    //             'over_time'     => $overtime[$i]['over_time'],
    //             'remarks'       => $overtime[$i]['remarks']
    //         );

    //         if ($DB->Insert(
    //             $Table['wo_overtime'],
    //             $FieldsOvertime
    //         )) {

    //             $return['status_overtime'][$i] = array(
    //                 'index' => $i,
    //                 'status' => 1
    //             );
    //         }
    //     }
    // }

    // for ($i = 0; $i < sizeof($aditional); $i++) {
    //     if (!empty($aditional[$i]['item_nama'])) {

    //         $FieldsAditional = array(
    //             'header'            => $id,
    //             'aditional'         => 1,
    //             'item_nama'         => $aditional[$i]['item_nama'],
    //             'qty'               => $aditional[$i]['qty'],
    //             'satuan'            => $aditional[$i]['satuan'],
    //             'keterangan'        => $aditional[$i]['keterangan']
    //         );

    //         if ($DB->Insert(
    //             $Table['wo_material'],
    //             $FieldsAditional
    //         )) {

    //             $return['status_aditional'][$i] = array(
    //                 'index' => $i,
    //                 'status' => 1
    //             );
    //         }
    //     }
    // }

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