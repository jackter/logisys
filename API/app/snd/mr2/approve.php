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
    'detail'    => 'mr_detail',
);

/**
 * Update Approve
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
	'table'			=> $Table['def'],
	'clause'		=> "WHERE id = '" . $id . "'",
	'action'		=> "approve",
	'description'	=> "Approve Material Request " . $kode
);
$History = Core::History($HistoryField);

$Field = array(
    'approved'      => 1,
    'approved_by'	=> Core::GetState('id'),
	'approved_date'	=> $Date,
	'history'		=> $History
);

if($DB->Update(
    $Table['def'],
    $Field,
    "id = '" . $id . "'"
)){
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
        'title'         => "APPROVE " . $MR['kode'],
        'content'       => '<strong>' . Core::GetUser('nama') . '</strong> APPROVE ' . $MR['kode'] . ', This transaction will continue to next process',
        'url'           => "/snd/pmr",
        'data'          => array(
            'id'    => $id
        ),
        'target'        => array(
            array(
                'modid'         => $Modid,
                'auth'          => 6
            ),
            array(
                'modid'         => 29,  //PMR,
                'auth'          => 2
            )
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