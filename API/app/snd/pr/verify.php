<?php
$Modid = 30;

Perm::Check($Modid, 'verify');

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
    'def'       => 'pr'
);

/**
 * Update Verify
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
	'table'			=> $Table['def'],
	'clause'		=> "WHERE id = '" . $id . "'",
	'action'		=> "verify",
	'description'	=> "Verify Purchase Request " . $kode
);
$History = Core::History($HistoryField);

$Field = array(
    'verified'      => 1,
    'verified_by'		=> Core::GetState('id'),
	'verified_date'	=> $Date,
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
    $MR = $DB->Result($DB->Query(
        'mr',
        array(
            'company',
            'dept',
            'kode',
            'create_by',
            'approved_by'
        ),
        "WHERE id = '" . $mr . "'"
    ));
    Notif::Send(array(
        'company'       => $MR['company'],
        'dept'          => $MR['dept'],
        'title'         => "VERIFY " . $pr_kode,
        'content'       => '<strong>' . strtoupper(Core::GetUser('nama')) . '</strong> VERIFY ' . $pr_kode . ", WAITING FOR APPROVAL",
        'url'           => $sys_url,
        'data'          => array(
            'id'    => $id
        ),
        'target'        => array(
            array(
                'modid'         => $Modid, 
                'auth'          => 5    // VERIFY
            ),
            array(
                'modid'         => $Modid, 
                'auth'          => 6    // APPROVE
            )
        ),
        'sendback'      => array(
            $MR['create_by'],
            $MR['approved_by'],
            $PR['create_by']
        )
    ));
    //=> / END : Notification
}else{
    $return = array(
        'status'    => 0,
        'error_msg' => $GLOBALS['mysql']->error
    );
}
//=> / END: Update Verify

echo Core::ReturnData($return);
?>