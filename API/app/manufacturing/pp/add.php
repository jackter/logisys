<?php

$Modid = 108;
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
    'def'       => 'produksi_param'
);

/**
 * Cek Bulan tahun
 */
$Check = $DB->Row($DB->Query(
    $Table['def'],
    array('id'),
    "
        WHERE
            month = '" . $month . "' AND
            year = '" . $year . "'
    "
));

if ($Check > 0) {

    $return = array(
        'status'    => 0,
        'error_msg' => 'Month & Year can not be the same'
    );

    echo Core::ReturnData($return);
    exit();
}
//=> End Cek Bulan Tahun


/**
 * Field
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
    'table'         => $Table['def'],
    'clause'        => "WHERE month = '" . $month . "' AND year = '" . $year . "'",
    'action'        => "add",
    'description'   => "Create Production Pram"
);
$History = Core::History($HistoryField);
$Field = array(
    'company'           => $company,
    'company_abbr'      => $company_abbr,
    'company_nama'      => $company_nama,
    'year'              => $year,
    'month'             => $month,
    'labour'            => $labour,
    'maintenance'       => $maintenance,
    'factory'           => $factory,
    'general'           => $general,
    'laboratory'        => $laboratory,
    'engineering'       => $engineering,
    'effulent'          => $effulent,
    'depreciation'      => $depreciation,
    'create_by'         => Core::GetState('id'),
    'create_date'       => $Date,
    'history'           => $History
);
//=> / END : Field
$DB->ManualCommit();

/**
 * Insert Data
 */
if ($DB->Insert(
    $Table['def'],
    $Field
)) {
    $DB->Commit();

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