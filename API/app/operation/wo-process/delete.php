<?php

$Modid = 197;
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
    'def'           => 'wo_proses',
    'detail'        => 'wo_proses_detail',
    'wo_material'   => 'wo_material'
);

$DB->ManualCommit();

if ($DB->Delete(
    $Table['def'],
    "id = '" . $id . "'"
)) {
    if (
        $DB->Delete(
            $Table['detail'],
            "
                header = '" . $id . "'
            "
        )
    ) {
        $return['status_detail'] = 1;
    }

    if (
        $DB->Delete(
            $Table['wo_material'],
            "
                header_wo_proses = '" . $id . "'
            "
        )
    ) {
        $return['status_material'] = 1;
    }

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