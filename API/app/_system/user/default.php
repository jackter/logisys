<?php
$Modid = 16;

//=> Default Statement
$return = [];
$RPL	= "";
$SENT	= Core::Extract($_POST, $RPL);

//=> Extract Array
if(isset($SENT)){
    foreach($SENT as $KEY => $VAL){	
        $$KEY = $VAL;
    }
}

//=> Get User List
include "app/_system/user/list.php";

//=> Include Company
include "app/_global/company.php";

//=> Include All Dept
include "app/_global/all.dept.php";

//=> Include All Cost Center
include "app/_global/all.cost_center.php";

echo Core::ReturnData($return);
?>