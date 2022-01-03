<?php
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
    'def'   => 'chat'
);

$Check = $DB->Row($DB->Query(
    $Table['def'],
    array(
        'id'
    ),
    "
        WHERE
            fromid = '" . $fromid . "' AND 
            toid = '" . $toid . "' AND 
            datesent = '" . $datesent . "'
    "
));
$return['status'] = 0;
if($Check <= 0){

    if($DB->Insert(
        $Table['def'],
        array(
            'fromid' => $fromid,
            'toid' => $toid,
            'message' => $message,
            'datesent' => $datesent,
            'datedb' => date('Y-m-d H:i:s')
        )
    )){
        $return['status'] = 1;
    }
    
}

echo Core::ReturnData($return);
?>