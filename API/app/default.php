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

if(!empty(Core::GetState('id'))){
    $return['user'] = array(
        'nama'      => Core::GetUser('nama'),
        'cp'        => Core::GetUser('cp')
    );   
}

echo Core::ReturnData($return);
?>