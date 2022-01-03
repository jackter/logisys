<?php 
$Modid = 30;

Perm::Check($Modid, 'back_pmr');

// Default Statement
$return = [];
$RPL    = "";
$SENT   = Core::Extract($_POST, $RPL);

// Extract Array
if (isset($SENT)) {
    foreach($SENT as $KEY => $VAL) {
        $$KEY = $VAL;
    }
}

$Table = array(
    'def'   => 'pr',
    'mr'    => 'mr'
);

/**
 * Back To PMR
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
	'table'			=> $Table['def'],
	'clause'		=> "WHERE id = '" . $id . "'",
	'action'		=> "back_pmr",
	'description'	=> "Roll Back Process PMR " . $kode
);
$History = Core::History($HistoryField);

$Field = array(
    'verified'      => 0,
    'approved'      => 0,
    'approved2'     => 0,
    'approved3'     => 0,
    'is_void'       => 1,
    'void_by'       => Core::GetState('id'),
    'void_date'     => $Date,
    'update_by'		=> Core::GetState('id'),
	'update_date'	=> $Date,
	'history'		=> $History
);

$DB->ManualCommit();

if ($DB->Update(
    $Table['def'],
    $Field,
    "id = '" . $id . "'"
)) {
    $return['status'] = 1; 
    
if ($DB->Update(
    $Table['mr'],
    array(
        'processed'     => 0,
        'update_by'     => Core::GetState('id'),
        'update_date'   => $Date
    ), 
    "id = '" . $mr . "'"
    
)){

    $DB->Commit();

    $return['status'] = 1; 
}
    
    // Notification
    $PR = $DB->Result($DB->Query(
        $Table['def'],
        array(
            'company',
            'dept',
            'kode',
            'create_by'
        ),
        "WHERE id = '" . $id . "'"
    ));
    Notif::Send(array(
        'company'   => $PR['company'],
        'dept'      => $PR['dept'],
        'title'     => "UNDO" . $PR['kode'],
        'content'   => '<strong>' . Core::GetUser('nama') . '</strong> UNDO' . $PR['kode']. ', PMR is Available to Modify Now.',
        'url'       => $sys_url,
        'data'      => array(
            'id'    => $id
        ),
        'target'        => array(
            array( // PMR Approve
                'modid'     => $Modid,
                'auth'      => 3
            ),
            array( // PMR Good Issued
                'modid'     => $Modid,
                'auth'      => 4
            ),
            array( // PMR  Purchase Request
                'modid'     => $Modid,
                'auth'      => 5 
            ),
        ),
        'sendback'      => array(
            $PR['create_by']
        )
    )); 
    // END : Notification
} else {
    $return = array(
        'status'    => 0,
        'error_msg' => " We have a problem to undo this process, please call Administrator."
    );
}
// END : Back To PMR

echo Core::ReturnData($return);

?>