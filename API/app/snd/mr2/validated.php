<?php
$Modid = 28;

Perm::Check($Modid, 'validate');

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
 * Update Approve
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
	'table'			=> $Table['def'],
	'clause'		=> "WHERE id = '" . $id . "'",
	'action'		=> "validated",
	'description'	=> "Validate Material Request " . $kode
);
$History = Core::History($HistoryField);

$Field = array(
    'validated'         => 1,
    'validated_by'	    => Core::GetState('id'),
	'validated_date'	=> $Date,
	'history'		    => $History
);

$DB->ManualCommit();

if($DB->Update(
    $Table['def'],
    $Field,
    "id = '" . $id . "'"
)){
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