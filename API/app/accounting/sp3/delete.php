<?php

$Modid = 109;
Perm::Check($Modid, 'hapus');

#Default Statement
$return = [];
$RPL = "";
$SENT = Core::Extract($_POST, $RPL);

#Extract array
if (isset($SENT)) {
    foreach ($SENT as $KEY => $VAL) {
        $$KEY = $VAL;
    }
}

$Table = array(
    'def'       => 'sp3',
    'detail'    => 'sp3_detail'
);

$DB->ManualCommit();

$P3 = $DB->Result($DB->Query(
    $Table['def'],
    array(
        'kode'
    ),
    "
        WHERE
            id = '" . $id . "'
    "
));

#Delete Data
if ($DB->Delete(
    $Table['detail'], 
    "header = '" . $id . "'"
)) {
    if ($DB->Delete(
        $Table['def'], 
        "id = '" . $id . "'"
    )) {
        $EP3 = $DB->Result($DB->QueryOn(
            DB['recon'],
            $Table['def'],
            array(
                'id'
            ),
            "
                WHERE
                    kode = '" . $P3['kode'] . "'
            "
        ));

        if ($DB->DeleteOn(
            DB['recon'],
            $Table['detail'], 
            "header = '" . $EP3['id'] . "'"
        )){
            $DB->DeleteOn(
                DB['recon'],
                $Table['def'], 
                "id = '" . $EP3['id'] . "'"
            );
        }

        $DB->Commit();
        $return['status'] = 1;
    }
} else {
    $return = array(
        'status' => 0,
        'error_msg' => 'Gagal Menghapus Data'
    );
}
echo Core::ReturnData($return);

?>