<?php

$Modid = 133;
Perm::Check($Modid, 'add');

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
    'def' => 'cost_center'
);

$Fields = array(
    'company'           => $company,
    'company_nama'      => $company_nama,
    'company_abbr'      => $company_abbr,
    'kode'              => $kode,
    'nama'              => $nama,
    'keterangan'        => $keterangan,
    'status'            => 1
);

#Insert Data
if ($DB->Insert($Table['def'], $Fields)) {
    $return['status'] = 1;
} else {
    $return = array(
        'status'    => 0,
        'error_msg' => 'Gagal Menyimpan Data'
    );
}
echo Core::ReturnData($return);

?>