<?php

$Modid = 192;
Perm::Check($Modid, 'hapus');

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
    'def'           => 'wo'
);

$DB->ManualCommit();

if ($DB->Delete(
    $Table['def'],
    "id = '" . $id . "'"
)) {
   
        $DB->Commit();

        $return['status'] = 1;
} else {
    $return = array(
        'status'        => 0,
        'error_msg'     => "Gagal Menghapus Data"
    );
}

echo Core::ReturnData($return);

?>