<?php

$Modid = 63;
Perm::Check($Modid, 'edit');

//=> Default Statement
$return = [];
$RPL    = "";
$SENT   = Core::Extract($_POST, $RPL);

//=> Extract Array
if (isset($SENT)) {
    foreach ($SENT as $KEY => $VAL) {
        $$KEY = $VAL;
    }
}

$Table = array(
    'def'       => 'sp3',
    'inv'       => 'invoice',
);

/**
 * Field
 */
$LIST = json_decode($list, true);

$Date = date("Y-m-d H:i:s");

$HistoryField = array(
    'table'         => $Table['def'],
    'clause'        => "WHERE id = '" . $id . "'",
    'action'        => "cancel",
    'description'   => "Cancel SP3"
);
$History = Core::History($HistoryField);

$Fields = array(
    'status'            => 0,
    'update_by'         => Core::GetState('id'),
    'update_date'       => $Date,
    'history'           => $History
);
//=> / END : Field

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

if ($DB->Update(
    $Table['def'],
    $Fields,
    "id = '" . $id . "'"
)) {

    $Fields = array(
        'sp3'       => 0,
        'sp3_kode'  => NULL
    );

    if ($DB->Update(
        $Table['inv'],
        $Fields,
        "sp3 = '" . $id . "'"
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

        $Fields = array(
            'approved'      => 0,
            'is_void'       => 1
        );

        if ($DB->UpdateOn(
            DB['recon'],
            $Table['def'],
            $Fields,
            "id = '" . $EP3['id'] . "'"
        )) {
            $DB->Commit();
            $return['status'] = 1;
        }
    }
} else {
    $return = array(
        'status' => 0,
        'error_msg' => 'Gagal Menyimpan Data'
    );
}
echo Core::ReturnData($return);

?>