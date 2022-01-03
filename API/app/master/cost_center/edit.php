<?php

$Modid = 133;
Perm::Check($Modid, 'edit');

# Default Statement
$return = [];
$RPL    = "";
$SENT   = Core::Extract($_POST, $RPL);

# Extract Array
if (isset($SENT)) {
    foreach ($SENT as $KEY => $VAL) {
        $$KEY = $VAL;
    }
}

$Table = array(
    'def' => 'cost_center',
);

$Field = array(
    'company' => $company,
    'company_nama' => $company_nama,
    'company_abbr' => $company_abbr,
    'nama'          => $nama,
    'kode'         => $kode,
    'keterangan'    => $keterangan
);

# Update Data
if ($DB->Update($Table['def'], $Field, "id = '" . $id . "'")) {
    $return['status'] = 1;
} else {
    $return = array(
        'status'    => 0,
        'error_msg' => $GLOBALS['mysql']->error
    );
}
echo Core::ReturnData($return);

?>