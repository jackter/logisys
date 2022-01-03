<?php
$Modid = 196;
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
    'def'           => 'job_alocation',
);

/**
 * Field
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
    'table'             => $Table['def'],
    'action'            => "add",
    'description'       => "Add New Job Alocation"
);
$History = Core::History($HistoryField);
$Field = array(
    'company'       => $company,
    'company_abbr'  => $company_abbr,
    'company_nama'  => $company_nama,
    'coa'           => $coa,
    'coa_kode'      => $coa_kode,
    'coa_nama'      => $coa_nama,
    'nama'          => $nama,
    'create_by'     => Core::GetState('id'),
    'create_date'   => $Date,
    'history'       => $History,
    'status'        => 1
);
//=> / END : Field

/**
 * Insert Data
 */
if ($DB->Insert(
    $Table['def'],
    $Field
)) {
    $return['status'] = 1;
} else {
    $return = array(
        'status'    => 0,
        'error_msg' => $GLOBALS['mysql']->error
    );
}
//=> / END : Insert Data

echo Core::ReturnData($return);

?>