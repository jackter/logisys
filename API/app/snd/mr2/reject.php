<?php
$Modid = 28;

Perm::Check($Modid, 'approve');

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
    'def'       => 'mr',
    'reject'    => 'mr_reject'
);

/**
 * Update Verify
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
	'table'			=> $Table['def'],
	'clause'		=> "WHERE id = '" . $id . "'",
	'action'		=> "reject",
	'description'	=> "Reject Request Set Initial Stock " . $kode
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

    $FieldReject = array(
        'mr'            => $id,
        'mr_kode'       => $kode,
        'keterangan'    => $reject_remarks,
        'create_by'     => Core::GetState('id'),
        'create_date'   => $Date
    );

    $DB->Insert(
        $Table['reject'],
        $FieldReject
    );

    $DB->Commit();

    $return['status'] = 1;

    /**
     * Notification
     */
    $MR = $DB->Result($DB->Query(
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
        'company'       => $MR['company'],
        'dept'          => $MR['dept'],
        'title'         => "REJECTING " . $MR['kode'],
        'content'       => '<strong>' . Core::GetUser('nama') . '</strong> REJECT ' . $MR['kode'] . ', Rollback MR Transactions',
        'url'           => $sys_url,
        'data'          => array(
            'id'    => $id
        ),
        'target'        => array(
            array(
                'modid'         => $Modid,
                'auth'          => 6
            ),
        ),
        'sendback'      => array(
            $MR['create_by']
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