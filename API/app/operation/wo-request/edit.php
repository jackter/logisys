<?php

$Modid = 192;
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
    'def'           => 'wo'

);

$Date = date('Y-m-d H:i:s');

$HistoryField = array(
    'table'         => $Table['def'],
    'action'        => "edit",
    'description'   => "Edit WO Request"
);
$History = Core::History($HistoryField);

$Fields = array(
    'order_date'        => $order_date_show,
    'company'           => $company,
    'company_abbr'      => $company_abbr,
    'company_nama'      => $company_nama,
    'dept'              => $dept,
    'dept_abbr'         => $dept_abbr,
    'dept_nama'         => $dept_nama,
    'job_title'         => $job_title,

    'dept_section_abbr' => $dept_section_abbr,
    'dept_section_nama' => $dept_section_nama,
    'lokasi'            => $lokasi,
    'lokasi_nama'       => $lokasi_nama,
    'shift'             => $shift,
    'section'           => $section,
    'equipment'         => $equipment,
    'equipment_kode'    => $equipment_kode,
    // 'workshop'          => $workshop,
    'maintenance_type'  => $maintenance_type,
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