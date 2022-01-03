<?php
$Modid = 29;

Perm::Check($Modid, 'back_mr');

//=> Default Statement
$return = [];
$RPL	= "";
$SENT   = Core::Extract($_POST, $RPL);

//=> Extract Array
if(isset($SENT)){
    foreach($SENT as $KEY => $VAL){	
        $$KEY = $VAL;
    }
}

$Table = array(
    'def'       => 'mr'
);

/**
 * Back To MR
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
	'table'			=> $Table['def'],
	'clause'		=> "WHERE id = '" . $id . "'",
	'action'		=> "back_mr",
	'description'	=> "Roll Back Process MR " . $kode
);
$History = Core::History($HistoryField);

$Field = array(
    'verified'      => 0,
    'approved'      => 0,
    'update_by'		=> Core::GetState('id'),
	'update_date'	=> $Date,
	'history'		=> $History
);

$DB->ManualCommit();

if($DB->Update(
    $Table['def'],
    $Field,
    "id = '" . $id . "'"
)){

    $DB->Commit();

    $return['status'] = 1;

    /**
     * Notification
     */
    $PMR = $DB->Result($DB->Query(
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
        'company'       => $PMR['company'],
        'dept'          => $PMR['dept'],
        'title'         => "UNDO " . $PMR['kode'],
        'content'       => '<strong>' . Core::GetUser('nama') . '</strong> UNDO ' . $PMR['kode'] . ', MR is Available to Modify Now.',
        'url'           => $sys_url,
        'data'          => array(
            'id'    => $id
        ),
        'target'        => array(
            array( // MR Approve
                'modid'         => $Modid,
                'auth'          => 6
            ),
            array( // MR Verify
                'modid'         => $Modid,
                'auth'          => 5
            ),
        ),
        'sendback'      => array(
            $PMR['create_by']
        )
    ));
    //=> / END : Notification
}else{
    $return = array(
        'status'    => 0,
        'error_msg' => "We Have a problem to undo this process, please call Administrator."
    );
}
//=> END :  Back To MR

echo Core::ReturnData($return);
?>