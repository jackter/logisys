<?php
$Modid = 48;

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
    'def' => 'taxmaster',
    'coa' => 'coa_master'
);

/* Field */
$Field = array(
    'code'          => $code,
    'company'       => $company,
    'company_abbr'  => $company_abbr,
    'company_nama'  => $company_nama,
    'description'   => $description,
    'rate'          => $rate,
    'tipe'          => $tipe,
    'pembukuan'     => $pembukuan,
    'coa'           => $coa,
    'coa_kode'      => $coa_kode,
    'coa_nama'      => $coa_nama,
    'status'        => 1
);

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
echo Core::ReturnData($return);

?>