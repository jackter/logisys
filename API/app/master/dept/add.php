<?php
$Modid = 84;

Perm::Check($Modid, 'add');

#Default Statement
$return = [];
$RPL    = "";
$SENT   = Core::Extract($_POST, $RPL);

#Extract Array
if (isset($SENT)) {
    foreach ($SENT as $KEY => $VAL) {
        $$KEY = $VAL;
    }
}

$Fields = array(
    'company'           => $company,
    'abbr'              => $abbr,
    'nama'              => $nama,
    'status'            => 1
);

#Insert Data
if ($DB->InsertOn(
    DB['master'],
    "dept",
    $Fields
)) {
    $return['status'] = 1;
} else {
    $return = array(
        'status'    => 0,
        'error_msg' => 'Gagal Menyimpan Data'
    );
}

echo Core::ReturnData($return);

?>