<?php
$Modid = 84;

Perm::Check($Modid, 'edit');

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

#Update Data
if ($DB->UpdateOn(
    DB['master'],
    "dept",
    array(
        'company'           => $company,
        'abbr'              => $abbr,
        'nama'              => $nama,
        'status'            => 1
    ),
    "
       id = '" . $id . "'
    "
)) {

    $return['status'] = 1;
} else {
    $return = array(
        'status'        => 0,
        'error_msg'     => 'Gagal Mengedit Data'
    );
}

echo Core::ReturnData($return);

?>
