<?php
$RPL = "";
$SENT   = Core::Extract($_POST, $RPL);

//=> Extract Array
if(!empty($SENT)){
    foreach($SENT as $KEY => $VAL){	
        $$KEY = $VAL;
    }
}

$i = 0;

if(!isset($load) && empty($load)){

    include "_menu/_module.php";

}else{

    include "_menu/_module.sub.php";

    $LoadFile = "app/_menu/" . $load . ".php";
    if(file_exists($LoadFile)){
        include $LoadFile;
    }

}

echo Core::ReturnData($menu);
?>