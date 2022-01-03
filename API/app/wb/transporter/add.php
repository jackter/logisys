<?php

$Modid = 78;
Perm::Check($Modid, 'add');

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
    'def'       => 'wb_transporter'
);

// $Date = date("Y-m-d H:i:s");

// $HistoryField = array(
// 	'table'			=> $Table['def'],
// 	'action'		=> "add",
// 	'description'	=> "Create New Transporter"
// );
// $History = Core::History($HistoryField);

// $Fields = array(
//     'nama'              => $nama,
//     'create_by'		    => Core::GetState('id'),
// 	'create_date'	    => $Date,
// 	'history'		    => $History,
// 	'status'		    => 1
// );

$Fields = array(
    'nama'              => $nama
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