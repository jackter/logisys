<?php
$Modid = 47;

Perm::Check($Modid, 'edit');

//=> Default Statement
$return = [];
$RPL	= "";
$SENT	= Core::Extract($_POST, $RPL);

//=> Extract Array
if(isset($SENT)){
    foreach($SENT as $KEY => $VAL){	
        $$KEY = $VAL;
    }
}

$Table = array(
    'def'   => 'wb_grn'
);

$list = json_decode($list_send, true);

/**
 * format data 
 */
$TRXID = [];
$format_trx = $COMMA = "";
foreach($list AS $Key => $Val){
    $format_trx .= $COMMA . $Val['id'];
    $COMMA = ",";
}
 // => end format data

/**
 * Field
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
	'table'			=> $Table['def'],
	'clause'		=> "WHERE id = '" . $id . "'",
	'action'		=> "edit",
	'description'	=> "Edit Inovoice"
);
$History = Core::History($HistoryField);

$Field = array(
    'id_trx'        => $format_trx,
    'note'          => $note,
    'update_by'		=> Core::GetState('id'),
	'update_date'	=> $Date,
	'history'		=> $History
);
//=> / END : Field

$DB->ManualCommit();

/**
 * Insert Data
 */

if($DB->Update(
    $Table['def'],
    $Field,
    "
        id = '" . $id . "'
    "
)){
    $DB->Commit();

    $return['status'] = 1;

}else{
    $return = array(
        'status'    => 0,
        'error_msg' => $GLOBALS['mysql']->error
    );
}
//>> End: Insert Data

echo Core::ReturnData($return);
?>