<?php

$Modid = 109;
Perm::Check($Modid, 'cancel');

#Default Statement
$return = [];
$RPL = "";
$SENT = Core::Extract($_POST, $RPL);

#Extract Array
if (isset($SENT)) {
    foreach ($SENT as $KEY => $VAL) {
        $$KEY = $VAL;
    }
}

$LIST = json_decode($list, true);

#Table List
$Table = array(
    'def'       => 'sp3'
);

$Date = date('Y-m-d H:i:s');

#Create history
$HistoryField = array(
    'table' => $Table['def'],
    'clause' => "WHERE id = '" . $id . "'",
    'action' => "cancel",
    'description' => "Cancel SP3"
);
$History = Core::History($HistoryField);

$Fields = array(
    'status'            => 0,
    'update_by'		    => Core::GetState('id'),
	'update_date'	    => $Date,
	'history'		    => $History
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

if ($DB->Update(
    $Table['def'],
    $Fields,
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

    $Fields = array(
        'approved'      => 0,
        'is_void'       => 1
    );

    if($DB->UpdateOn(
        DB['recon'],
        $Table['def'],
        $Fields,
        "id = '" . $EP3['id'] . "'"
    )){
        $DB->Commit();
        $return['status'] = 1;
    }

} else {
    $return = array(
        'status' => 0,
        'error_msg' => 'Gagal Menyimpan Data'
    );
}
echo Core::ReturnData($return);

?>