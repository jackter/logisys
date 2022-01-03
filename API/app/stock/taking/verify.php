<?php
$Modid = 38;

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
    'def'       => 'stock_taking',
);

/**
 * Update Verify
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
	'table'			=> $Table['def'],
	'clause'		=> "WHERE id = '" . $id . "'",
	'action'		=> "verify",
	'description'	=> "Verify Stock Taking " . $kode
);
$History = Core::History($HistoryField);

$Field = array(
    'verified'      => 1,
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
    /**
     * Notification
     */
    $STK = $DB->Result($DB->Query(
        $Table['def'],
        array(
            'company',
            'kode'
        ),
        "WHERE id = '" . $id . "'"
    ));
    Notif::Send(array(
        'company'       => $STK['company'],
        //'dept'          => $STK['dept'],
        'title'         => "REQUEST " . $STK['kode'],
        'content'       => '<strong>' . strtoupper(Core::GetUser('nama')) . '</strong> verify ' . $STK['kode'] . ', Waiting Approval',
        'url'           => $sys_url,
        'data'          => array(
            'id'    => $id
        ),
        'target'        => array(
            array(
                'modid'         => $Modid,
                'auth'          => 6
            ),
        )
    ));
    //=> / END : Notification

    $DB->Commit();
    $return['status'] = 1;
}else{
    $return = array(
        'status'    => 0,
        'error_msg' => $GLOBALS['mysql']->error
    );
}
//=> / END: Update Verify

echo Core::ReturnData($return);
?>