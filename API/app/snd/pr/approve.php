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
$DESC = "Manager Approve Purchase Request (" . $kode . ")";
if($lvl == 2){
    Perm::Check($Modid, 'approve2');
    $apvd_lvl = 2;
    $DESC = "(Dirkom/Head) Approve Purchase Request (" . $kode . ")";
}elseif($lvl == 3){
    Perm::Check($Modid, 'approve3');
    $apvd_lvl = 3;
    $DESC = "(CEO) Approve Purchase Request (" . $kode . ")";
}elseif($lvl == 1){
    $apvd_lvl = "";
    Perm::Check($Modid, 'approve');
}else{
    echo "Approve Failed";
    exit();
}
//=> / END : Set Apvd Level

/**
 * Set Finish
 */
$is_finish = false;
if($apvd == $lvl){
    $is_finish = true;
}
//=> / END : Set Finish

$Table = array(
    'def'       => 'pr',
    'detail'    => 'pr_detail',
);

/**
 * Update Approve
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
	'table'			=> $Table['def'],
	'clause'		=> "WHERE id = '" . $id . "'",
	'action'		=> "approve" . $apvd_lvl,
	'description'	=> $DESC
);
$History = Core::History($HistoryField);

$Field = array(
    'approved' . $apvd_lvl              => 1,
    'approved' . $apvd_lvl . '_by'	    => Core::GetState('id'),
	'approved' . $apvd_lvl . '_date'	=> $Date,
	'history'		=> $History
);

if($is_finish){
    $Field['finish'] = 1;
    $Field['finish_date'] = $Date;
}

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
    //=> / END : Send Back

    /**
     * Target
     */
    $TITLE_APVD = "APPROVED " . $pr_kode;
    $WAITING = "";
    if($apvd > 1 && $lvl == 1){
        $Target[0] = array(
            'modid'         => $Modid, 
            'auth'          => 7    // Approved 2
        );
        //$SendBack[] = $PR['approved_by'];

        $WAITING = ", Waiting for Next Approval";
    }
    if($apvd > 2 && $lvl == 2){
        $Target[0] = array(
            'modid'         => $Modid, 
            'auth'          => 8    // Approved 3
        );
        //$SendBack[] = $PR['approved2_by'];

        $WAITING = ", Waiting for Last Approval";
    }

    if(!empty($PR['approved_by'])){
        $SendBack[] = $PR['approved_by'];
    }
    if(!empty($PR['approved2_by'])){
        $SendBack[] = $PR['approved2_by'];
    }
    if(!empty($PR['approved3_by'])){
        $SendBack[] = $PR['approved3_by'];
    }

    $SendBack = array_unique($SendBack);

    if($lvl == 3){
        $WAITING = ", <strong class='primary-fg'>Ready to Create Purchase Quotations</strong>";
    }
    //=> / END : Target

    Notif::Send(array(
        'company'       => $MR['company'],
        'dept'          => $MR['dept'],
        'title'         => $TITLE_APVD,
        'content'       => '<strong>' . strtoupper(Core::GetUser('nama')) . '</strong> APPROVED ' . $pr_kode . $WAITING,
        'url'           => $sys_url,
        'data'          => array(
            'id'    => $id
        ),
        'target'        => $Target,
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