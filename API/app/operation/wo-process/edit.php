<?php

$Modid = 197;
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
$aditional = json_decode($list_aditional, true);
$overtime = json_decode($list_overtime, true);


$Table = array(
    'def'           => 'wo_proses',
    'detail'        => 'wo_proses_detail',
    'wo_material'   => 'wo_material',
    'wo_overtime'   => 'wo_overtime'
);

$Date = date('Y-m-d H:i:s');

$HistoryField = array(
    'table'         => $Table['def'],
    'action'        => "edit",
    'description'   => "Edit Wo Process"
);
$History = Core::History($HistoryField);

$Fields = array(
    'tanggal'           => $tanggal_send,
    'job_explain'       => $job_explan,
    'running_hours'     => $running_hours,
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
        $Table['detail'],
        "header = '" . $id . "'"
    );

    $DB->Delete(
        $Table['wo_material'],
        "header_wo_proses = '" . $id . "' AND aditional = 1"
    );

    $DB->Delete(
        $Table['wo_overtime'],
        "header = '" . $id . "'"
    );

    for ($i = 0; $i < sizeof($mechanic); $i++) {
        if (!empty($mechanic[$i]['nama'])) {

            $FieldsMechanic = array(
                'wo_header'     => $wo,
                'header'        => $id,
                'kid'           => $mechanic[$i]['id'],
                'nik'           => $mechanic[$i]['nik'],
                'nama'          => $mechanic[$i]['nama'],
                'start_time'    => $mechanic[$i]['start_format'],
                'end_time'      => $mechanic[$i]['end_format'],
                'act_hours'     => $mechanic[$i]['act_hours'],
                'level'         => $mechanic[$i]['level']
            );

            if ($DB->Insert(
                $Table['detail'],
                $FieldsMechanic
            )) {

                $return['status_detail'][$i] = array(
                    'index' => $i,
                    'status' => 1
                );
            }
        }
    }

    for ($i = 0; $i < sizeof($aditional); $i++) {
        if (!empty($aditional[$i]['item_nama'])) {

            $FieldsAditional = array(
                'header'            => $wo,
                'header_wo_proses'  => $id,
                'aditional'         => 1,
                'item_nama'         => $aditional[$i]['item_nama'],
                'qty'               => $aditional[$i]['qty'],
                'satuan'            => $aditional[$i]['satuan'],
                'keterangan'        => $aditional[$i]['keterangan']
            );

            if ($DB->Insert(
                $Table['wo_material'],
                $FieldsAditional
            )) {

                $return['status_aditional'][$i] = array(
                    'index' => $i,
                    'status' => 1
                );
            }
        }
    }

    for ($i = 0; $i < sizeof($overtime); $i++) {
        if (!empty($overtime[$i]['nama'])) {

            $FieldsOvertime = array(
                'wo_header'     => $wo,
                'header'        => $id,
                'kid'           => $overtime[$i]['id'],
                'nik'           => $overtime[$i]['nik'],
                'nama'          => $overtime[$i]['nama'],
                'level'         => $overtime[$i]['level'],
                'over_date'     => $overtime[$i]['over_date'],
                'start_time'    => $overtime[$i]['start_over_format'],
                'end_time'      => $overtime[$i]['end_over_format'],
                'over_time'     => $overtime[$i]['over_time'],
                'remarks'       => $overtime[$i]['remarks']
            );

            if ($DB->Insert(
                $Table['wo_overtime'],
                $FieldsOvertime
            )) {

                $return['status_overtime'][$i] = array(
                    'index' => $i,
                    'status' => 1
                );
            }
        }
    }

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