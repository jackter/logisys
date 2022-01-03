<?php
$Modid = 31;

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
    'def'       => 'pq',
    'reject'    => 'pq_reject'
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

    $FieldReject = array(
        'pq'            => $id,
        'pq_kode'       => $pq_kode,
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
}else{
    $return = array(
        'status'    => 0,
        'error_msg' => $GLOBALS['mysql']->error
    );
}
//=> / END: Update Verify

echo Core::ReturnData($return);
?>