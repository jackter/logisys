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

$Q_Chat = $DB->Query(
    $Table['def'],
    array(),
    "
        WHERE
            (
                fromid = '" . $currentid . "' AND 
                toid = '" . $userid . "'
            ) OR 
            (
                fromid = '" . $userid . "' AND 
                toid = '" . $currentid . "'
            )
        ORDER BY
            id DESC,
            datesent DESC
        LIMIT 100
    "
);
$R_Chat = $DB->Row($Q_Chat);
if($R_Chat > 0){
    while($Chat = $DB->Result($Q_Chat)){
        $return['data'][] = $Chat;
    }
}

echo Core::ReturnData($return);
?>