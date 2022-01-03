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

$Q_Notif = $DB->QueryPort("
    SELECT
        U.id,
        N.title,
        N.content,
        N.data,
        N.url,
        U.seen,
        U.pushed,
        U.create_date
    FROM
        notif AS N,
        notif_user AS U
    WHERE
        U.notif = N.id AND 
        U.seen = 0 AND
        U.recipient = '" . Core::GetState('id') . "'
    ORDER BY 
        create_date DESC
    LIMIT 100
");
$R_Notif = $DB->Row($Q_Notif);
if($R_Notif > 0){
    $i = 0;
    while($Notif = $DB->Result($Q_Notif)){

        $return['notif']['data'][$i] = $Notif;
        $return['notif']['data'][$i]['pushed'] = (int)$Notif['pushed'];
        $return['notif']['data'][$i]['seen'] = (int)$Notif['seen'];

        $return['notif']['data'][$i]['create_date'] = date('d/m/Y H:i:s') . " WIB";

        $i++;

    }
}

//=> Read
if($notif_action == "read"){
    $DB->Update(
        'notif_user',
        array(
            'seen'  => 1
        ),
        "id = '" . $id . "'"
    );
}

//=> Pushed
if($notif_action == "push"){
    $ids = json_decode($id, true);

    /*foreach($ids as $id){
        $DB->Update(
            'notif_user',
            array(
                'pushed'  => 1
            ),
            "id = '" . $id . "'"
        );
    }*/
    $DB->Update(
        'notif_user',
        array(
            'pushed'    => 1
        ),
        "id IN (" . implode(",", $ids) . ")"
    );

}

//=> Unread Notification
$Unread = $DB->Row($DB->Query(
    "notif_user",
    array('id'),
    "
        WHERE
            recipient = '" . Core::GetState('id') . "' AND 
            seen = 0
    "
));
if($Unread > 0){
    $return['notif']['unread'] = $Unread;
}

echo Core::ReturnData($return);
?>