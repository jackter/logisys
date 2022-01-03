<?php
$Modid = 49;

Perm::Check($Modid, 'hapus');
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

/* Delete Data */
if ($DB->DeleteOn(
    DB['master'],
    "company",
    "id = '" . $id . "'"
)) {
    $return['status'] = 1;
} else {
    $return = array(
        'status' => 0,
        'error_msg' => 'Gagal Menghapus Data'
    );
}

echo Core::ReturnData($return);

?>