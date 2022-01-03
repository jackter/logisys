<?php

$Modid = 194;

$return = [];
$RPL    = "";
$SENT   = Core::Extract($_POST, $RPL);

if (isset($SENT)) {
    foreach ($SENT as $KEY => $VAL) {
        $$KEY = $VAL;
    }
}

//=> Company
include "app/_global/company.php";

$return['permissions'] = Perm::Extract($Modid);

echo Core::ReturnData($return);

?>