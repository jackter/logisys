<?php
/**
 * User
 */
$Q_User = $DB->Query(
    "sys_user",
    array(
        'id',
        'username',
        'nama'
    ),
    "
        WHERE 
            status != 0 AND 
            id != 1
    "
);
$R_User = $DB->Row($Q_User);
if($R_User > 0){
    $i = 0;
    while($User = $DB->Result($Q_User)){

        $return['user'][$i] = $User;

        $i++;

    }
}
//=> / END : User
?>