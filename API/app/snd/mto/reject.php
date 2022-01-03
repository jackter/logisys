<?php
$Modid = 129;

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
    'def'       => 'mto'
);

/**
 * Update Verify
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
	'table'			=> $Table['def'],
	'clause'		=> "WHERE id = '" . $id . "'",
	'action'		=> "reject",
	'description'	=> "Reject Material Transfer Request Out " . $kode
);
$History = Core::History($HistoryField);

$Field = array(
    'verified'      => 0,
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
    $MTO = $DB->Result($DB->Query(
        $Table['def'],
        array(
            'company',
            //'dept',
            'kode',
            'create_by'
        ),
        "WHERE id = '" . $id . "'"
    ));
    Notif::Send(array(
        'company'       => $MTO['company'],
        //'dept'          => $MT['dept'],
        'title'         => "REJECTED " . $MTO['kode'],
        'content'       => '<strong>' . Core::GetUser('nama') . '</strong> REJECT ' . $MTO['kode'] . ', Rollback MTO Transactions',
        'url'           => $sys_url,
        'data'          => array(
        'id'            => $id
        ),
        'target'        => array(
            array(
                'modid'         => $Modid,
                'auth'          => 6
            ),
        ),
        'sendback'      => array(
            $MT['create_by']
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