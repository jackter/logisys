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

$TABLE = "user_log";
$ID = Core::GetState('id');
$IP = get_client_ip();
$page = $_POST['sys_url'];
$target = $_POST['api_url'];
$Date = date('Y-m-d H:i:s');

$Check = $DB->Row($DB->Query(
    $TABLE,
    array(
        'uid',
        'page'
    ),
    "
        WHERE
            uid = '".$ID."' AND
            page = '".$page."' AND
            target = '".$target."' AND
            last_seen = '".$Date."'

    "
));
if($Check <= 0){

    $User = array(
        'uid'           => $ID,
        'username'      => Core::GetUser('username', $ID),
        'nama'          => Core::GetUser('nama', $ID),
        'last_seen'     => $Date,
        'page'          => $page,
        'target'        => $target,
        'ip'            => $IP
    );

    $DB->Insert(
        $TABLE,
        $User
    );
}
?>