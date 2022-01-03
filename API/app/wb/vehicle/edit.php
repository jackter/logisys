<?php

$Modid = 79;
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
    'def'           => 'wb_vehicle',
);

// $Date = date("Y-m-d H:i:s");

// $HistoryField = array(
// 	'table'			=> $Table['def'],
// 	'clause'		=> "WHERE id = '" . $id . "'",
// 	'action'		=> "edit",
// 	'description'	=> "Edit Vehicle"
// );

/**
 * Field
 */
// $Field = array(
//     'nopol'             => strtoupper($nopol),
//     'transporter'       => $transporter,
//     'update_by'		    => Core::GetState('id'),
// 	'update_date'	    => $Date,
// 	'history'		    => $History
// );

$Field = array(
    'nopol'             => strtoupper($nopol),
    'transporter'       => $transporter
);
//=> / END : Field
$DB->ManualCommit();

/**
 * Update Data
 */
if ($DB->Update(
    $Table['def'],
    $Field,
    "id = '" . $id . "'",
    array(
        'wbclone'   => true
    ),
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
        'error_msg' => $GLOBALS['mysql']->error
    );
}
//=> / END : Update Data

echo Core::ReturnData($return);

?>