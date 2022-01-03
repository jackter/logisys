<?php
$Modid = 30;

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

/**
 * Set Apvd Level
 */
$apvd_lvl = "";
$DESC = "Reject Purchase Request (" . $kode . ") to Revise";
if($lvl == 2){
    Perm::Check($Modid, 'approve2');
    $apvd_lvl = 2;
    $DESC = "(Dirkom/Head) Reject Purchase Request (" . $kode . ")";
}elseif($lvl == 3){
    Perm::Check($Modid, 'approve3');
    $apvd_lvl = 3;
    $DESC = "(CEO) Reject Purchase Request (" . $kode . ")";
}else{
    Perm::Check($Modid, 'approve');
}
//=> / END : Set Apvd Level

$Table = array(
    'def'       => 'pr',
    'reject'    => 'pr_reject'
);

/**
 * Update Verify
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
	'table'			=> $Table['def'],
	'clause'		=> "WHERE id = '" . $id . "'",
	'action'		=> "reject",
	'description'	=> $DESC
);
$History = Core::History($HistoryField);

$Field = array(
    'verified'      => 0,
    'approved'      => 0,
    'approved2'     => 0,
    'approved3'     => 0,
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
    // $return['status'] = 1;

    $FieldReject = array(
        'pr'            => $id,
        'pr_kode'       => $kode,
        'keterangan'    => $keterangan,
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
    $PR = $DB->Result($DB->Query(
        "pr",
        array(
            'create_by',
            'approved_by',
            'approved2_by',
            'approved3_by'
        ),
        "
            WHERE
                id = '" . $id . "'
        "
    ));

    /**
     * Send Back
     */
    $SendBack = array(
        $MR['create_by'],
        $MR['approved_by'],
        $PR['create_by']
    );
    if(!empty($PR['approved_by'])){
        $SendBack[] = $PR['approved_by'];
    }
    if(!empty($PR['approved2_by'])){
        $SendBack[] = $PR['approved2_by'];
    }
    if(!empty($PR['approved3_by'])){
        $SendBack[] = $PR['approved3_by'];
    }
    //=> / END : Send Back

    Notif::Send(array(
        'company'       => $MR['company'],
        'dept'          => $MR['dept'],
        'title'         => "REJECT " . $pr_kode,
        'content'       => '<strong>' . strtoupper(Core::GetUser('nama')) . '</strong> <strong class="red-fg">REJECTED</strong> ' . $pr_kode,
        'url'           => $sys_url,
        'data'          => array(
            'id'    => $id
        ),
        //'target'        => $Target,
        'sendback'      => $SendBack
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