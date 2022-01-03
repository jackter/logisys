<?php

//=> Default Statement
$return = [];
$RPL    = "";
$SENT    = Core::Extract($_POST, $RPL);

//=> Extract Array
if (isset($SENT)) {
    foreach ($SENT as $KEY => $VAL) {
        $$KEY = $VAL;
    }
}

//=> Company
include "app/_global/company.php";

$Maintenance = Core::GetParams(array('maintenance_type'));
$return['maintenance'] = $Maintenance['maintenance_type'];

$DeptSection = Core::GetParams(array('dept_section'));
$return['dept_section'] = $DeptSection['dept_section'];

echo Core::ReturnData($return);

?>