<?php
// $Modid = 79;

// Perm::Check($Modid, 'add');

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

$Table = array(
    'def'       => 'wb_vehicle'
);

// $Date = date("Y-m-d H:i:s");

// $HistoryField = array(
// 	'table'			=> $Table['def'],
// 	'action'		=> "add",
// 	'description'	=> "Create New Vehicle"
// );
// $History = Core::History($HistoryField);

// $Fields = array(
//     'nopol'             => strtoupper($nopol),
//     'transporter'       => $transporter,
//     'create_by'		    => Core::GetState('id'),
// 	'create_date'	    => $Date,
// 	'history'		    => $History,
// 	'status'		    => 1
// );

$Fields = array(
    'nopol'             => strtoupper($nopol),
    'transporter'       => $transporter
);

$DB->ManualCommit();

/*Insert Data*/
if ($DB->Insert(
    $Table['def'],
    $Fields,
    array(
        'wbclone'   => true
    )
)) {

    if ($get_data == 1) {
        $GetData = $DB->Result($DB->Query(
            $Table['def'],
            array(),
            "
            WHERE
            nopol = '" . $nopol . "' AND 
            transporter = '" . $transporter . "'
            "
        ));
        $return['data'] = $GetData;
    }

    $DB->Update(
        'wb_state',
        array(
            'last_update' => date('Y-m-d H:i:s')
        ),
        "`table` = '" . $Table['def'] . "'"
    );
    $DB->Commit();

    $return['status'] = 1;
} else {
    $return = array(
        'status'    => 0,
        'error_msg' => 'Gagal Menyimpan Data'
    );
}

echo Core::ReturnData($return);

?>