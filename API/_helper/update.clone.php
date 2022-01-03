<?php
exit();
set_time_limit(0);

$Q_Data = $DB->Query(
    'item_downstream_global',
    array(),
    "
        WHERE
            global_id IS NOT NULL
    "
);
$R_Data = $DB->Row($Q_Data);
if($R_Data > 0){
    while($Data = $DB->Result($Q_Data)){        

        /**
         * Update Clone
         */
        if($DB->UpdateOn(
            DB['master'],
            'item_global',
            array(
                'clone' => 1
            ),
            "
                id = '" . $Data['global_id'] . "' AND 
                clone = 0
            "
        )){
            echo $Data['global_id'] . "<br>";
        }
        //=> / END : Update Clone

    }
}
?>