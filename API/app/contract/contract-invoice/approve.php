<?php
$Modid = 179;
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

$list = json_decode($list, true);

$Table = array(
    'def'       => 'kontrak_invoice'
);

/**
 * Update Approve
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
	'table'			=> $Table['def'],
	'clause'		=> "WHERE id = '" . $id . "'",
	'action'		=> "approve",
	'description'	=> "Approve Contract Invoice"
);
$History = Core::History($HistoryField);

$Field = array(
    'approved'      => 1,
    'approved_by'	=> Core::GetState('id'),
	'approved_date'	=> $Date,
	'history'		=> $History
);

$DB->ManualCommit();

if($DB->Update(
    $Table['def'],
    $Field,
    "id = '" . $id . "'"
)){

    if($enable_journal == 1){
        
    }

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