<?php
$Modid = 53;

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
    'def'           => 'ast_type'
);

/**
 * Field
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
    'table'            => $Table['def'],
    'clause'        => "WHERE id = '" . $id . "'",
    'action'        => "add",
    'description'    => "Added new Asset Type (" . $id . ")"
);
$History = Core::History($HistoryField);

$Field = array(
    'company'       => $company,
    'company_abbr'  => $company_abbr,
    'company_nama'  => $company_nama,
    'initial_code'  => $initial_code,
    'nama'          => $nama,
    'depreciation_method'   => $depreciation_method,
    'est_year'      => $est_year,
    'create_by'        => Core::GetState('id'),
    'create_date'    => $Date,
    'history'        => $History,
    'status'        => 1
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