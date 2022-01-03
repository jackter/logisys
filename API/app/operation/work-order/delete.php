<?php

$Modid = 138;
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
    'def'           => 'wo',
    'wo_activity'   => 'wo_activity',
    'wo_material'   => 'wo_material',
    'wo_mechanic'   => 'wo_mechanic'
);

$DB->ManualCommit();

if ($DB->Delete(
    $Table['def'],
    "id = '" . $id . "'"
)) {
    if (
        $DB->Delete(
            $Table['wo_activity'],
            "
                header = '" . $id . "'
            "
        )
    ) {
        $return['status'] = 1;
    }

    if (
        $DB->Delete(
            $Table['wo_material'],
            "
                header = '" . $id . "'
            "
        )
    ) {
        $return['status'] = 1;
    }

    if (
        $DB->Delete(
            $Table['wo_mechanic'],
            "
                header = '" . $id . "'
            "
        )
    ) {

        $DB->Commit();

        $return['status'] = 1;
    }
} else {
    $return = array(
        'status'        => 0,
        'error_msg'     => "Gagal Menghapus Data"
    );
}

echo Core::ReturnData($return);

?>