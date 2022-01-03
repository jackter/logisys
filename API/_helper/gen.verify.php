<?php
set_time_limit(0);

$Table = strip_tags($_GET['t']);

if(isset($Table) && !empty($Table)){

    $Q_Data = $DB->Query(
        $Table,
        array(
            'id',
            'history'
        ),
        "
            WHERE
                verified = 1 AND 
                (
                    verified_by IS NULL OR
                    verified_by = 0
                )
        "
    );
    $R_Data = $DB->Row($Q_Data);
    if($R_Data > 0){
        while($Data = $DB->Result($Q_Data)){

            $History = json_decode($Data['history'], true);

            foreach($History AS $Key => $Val){
                if($Val['action'] == 'verify'){
                    /*echo "<pre>";
                    print_r($Val);
                    echo "</pre>";*/
                    echo "User: " . $Val['user'] . "<br>";
                    echo "Username: " . $Val['username'] . "<br>";
                    echo "Date: " . $Val['time'] . "<br>";
                    echo "<hr>";

                    $DB->Update(
                        $Table,
                        array(
                            'verified_by' => $Val['user'],
                            'verified_date' => $Val['time']
                        ),
                        "
                            id = '" . $Data['id'] . "' AND 
                            verified = 1
                        "
                    );

                }
            }

        }
    }

}else{
    echo "Please specify a table name for target.";
}
?>