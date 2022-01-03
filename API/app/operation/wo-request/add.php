<?php
$Modid = 192;
Perm::Check($Modid, 'add');

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

/**
 * Create Code
 */
$Time = romawi(date('n')) . "/" . date('Y');
$InitialCode = "WOR/" . strtoupper($company_abbr) . "-" . strtoupper($dept_abbr) . "/" . $Time . "/";
$Len = 4;
$LastKode = $DB->Result($DB->Query(
    $Table['def'],
    array('req_kode'),
    "
        WHERE
            req_kode LIKE '" . $InitialCode . "%' 
        ORDER BY 
            REPLACE(req_kode, '" . $InitialCode . "', '') DESC
    "
));
$LastKode = (int) substr($LastKode['req_kode'], -$Len) + 1;
$LastKode = str_pad($LastKode, $Len, 0, STR_PAD_LEFT);

$kode_req = $InitialCode . $LastKode;
//=> END : Create Code

/**
 * Create Code
 */
if($section) {
    $SEC = "MTC" . "-" . $section;
}

$Bulan = romawi(date('n'));
$Tahun = date('Y');
$InitialCode = "/" . $Bulan . "/WO/" . $company_abbr . "/" . $dept_abbr . "-" . $dept_section_abbr . "/" . $SEC . "/" . $Tahun;
$Len = 3;
$LastKode = $DB->Result($DB->Query(
    $Table['def'],
    array('kode'),
    "
        WHERE
            kode LIKE '%" . $InitialCode . "' 
        ORDER BY 
            REPLACE(kode, '', '" . $InitialCode . "') DESC
    "
));
$LastKode = (int)substr($LastKode['kode'], 0, $Len) + 1;
$LastKode = str_pad($LastKode, $Len, 0, STR_PAD_LEFT);
$kode = $LastKode . $InitialCode;
//=> END : Create Code

$Date = date('Y-m-d H:i:s');

$HistoryField = array(
    'table'         => $Table['def'],
    'action'        => "add",
    'description'   => "Add Work Order Request"
);
$History = Core::History($HistoryField);

$Fields = array(
    'req_kode'          => $kode_req,
    'kode'              => $kode,
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
    'maintenance_type'  => $maintenance_type,
    'create_by'         => Core::GetState('id'),
    'create_date'       => $Date,
    'history'           => $History,
    'status'            => 1
);

$DB->ManualCommit();

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