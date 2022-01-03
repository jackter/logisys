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

// Function to get the client IP address
function get_client_ip() {
    $ipaddress = '';
    if (getenv('HTTP_CLIENT_IP'))
        $ipaddress = getenv('HTTP_CLIENT_IP');
    else if(getenv('HTTP_X_FORWARDED_FOR'))
        $ipaddress = getenv('HTTP_X_FORWARDED_FOR');
    else if(getenv('HTTP_X_FORWARDED'))
        $ipaddress = getenv('HTTP_X_FORWARDED');
    else if(getenv('HTTP_FORWARDED_FOR'))
        $ipaddress = getenv('HTTP_FORWARDED_FOR');
    else if(getenv('HTTP_FORWARDED'))
       $ipaddress = getenv('HTTP_FORWARDED');
    else if(getenv('REMOTE_ADDR'))
        $ipaddress = getenv('REMOTE_ADDR');
    else
        $ipaddress = 'UNKNOWN';
    return $ipaddress;
}

$TABLE = "useronline";
//$ID = Core::GetState('id');
$ID = $User['id'];
$IP = get_client_ip();

/**
 * Check for Limit Update by time
 */
$CheckAll = $DB->Row($DB->Query(
    $TABLE,
    array(
        'uid',
        'page'
    )
));
$Check = $DB->Row($DB->Query(
    $TABLE,
    array(
        'uid',
        'page'
    ),
    "
        WHERE
            last_update <= DATE_SUB(NOW(), INTERVAL 3 SECOND)
    "
));
//=> / END : Check for Limit Update by time

if($CheckAll <= 0){

    $User = array(
        'uid'           => $ID,
        'username'      => Core::GetUser('username', $ID),
        'nama'          => Core::GetUser('nama', $ID),
        'last_update'   => date('Y-m-d H:i:s'),
        'page'          => $page,
        'ip'            => $IP
    );

    $DB->Insert(
        $TABLE,
        $User
    );

}else if($Check > 0){

    /**
     * Delete Expire
     */
    $Q_Expire = $DB->Query(
        $TABLE,
        array(
            'uid'
        ),
        "
            WHERE 
                last_update <= DATE_SUB(NOW(), INTERVAL 30 MINUTE)
        "
    );
    $R_Expire = $DB->Row($Q_Expire);
    if($R_Expire > 0){
        while($Expire = $DB->Result($Q_Expire)){
            $DB->Delete(
                $TABLE,
                "uid = '" . $Expire['uid'] . "'"
            );
        }
    }
    //=> / END : Delete Expire

    if(!empty($ID)){

        $User = array(
            'uid'           => $ID,
            'username'      => Core::GetUser('username', $ID),
            'nama'          => Core::GetUser('nama', $ID),
            'last_update'   => date('Y-m-d H:i:s'),
            'page'          => $page,
            'ip'            => $IP
        );

        $Q_Online = $DB->Query(
            $TABLE,
            array(
                'uid'
            ),
            "
                WHERE
                    uid = '" . $ID . "' AND 
                    ip = '" . $IP . "'
            "
        );
        $R_Online = $DB->Row($Q_Online);
        if($R_Online > 0){
            $DB->Update(
                $TABLE,
                $User,
                "uid = '" . $ID . "' AND ip = '" . $IP . "'"
            );
        }else{
            $DB->Insert(
                $TABLE,
                $User
            );
        }

        $ReturnState['update'] = $ID;
    }

    //echo Core::ReturnData($return);
}
?>