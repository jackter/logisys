<?php

$Modid = 68;

Perm::Check($Modid, 'draft');

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
    'def'       => 'kontrak'
);

$Date = date("Y-m-d H:i:s");

$HistoryField = array(
    'table'         => $Table['def'],
    'clause'        => "WHERE id = '" . $id . "'",
    'action'        => "draft",
    'description'   => "Draft Sales Contract " . $kode
);
$History = Core::History($HistoryField);

$DB->ManualCommit();

if($DB->Update(
    $Table['def'],
    array(
        'verified'              => 0,
        'approved'              => 0,
        'update_by'             => Core::GetState('id'),
        'update_date'           => $Date,
        'history'               => $History
    ),
    "
        id = '" . $id . "'
    "
)){

    $DB->Commit();
    $return['status'] = 1;

}else{
    $return = array(
        'status'        => 0,
        'error_msg'     => "Cannot Draft Sales Contract"
    );
}


echo Core::ReturnData($return);
?>