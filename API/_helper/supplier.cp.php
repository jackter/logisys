<?php
$Q_Data = $DB->Query(
    "supplier",
    array(
        'cp_manual'
    )
);
$R_Data = $DB->Row($Q_Data);
if($R_Data > 0){
    ?>
    <table border="1">
    <?php
    while($Data = $DB->Result($Q_Data)){
        //echo $Data['cp_manual'] . "<br>";
        echo '<tr>';
        echo '<td>' . $Data['cp_manual'] . '</td>';

        $CP = explode("/", $Data['cp_manual']);

        if(sizeof($CP) > 0){
            foreach($CP AS $Val){

                $Val = preg_replace("/[^0-9]/", '', $Val);

                //echo $Val . "\t ";
                echo '<td>' . $Val . '</td>';
            }
        }
        echo "</tr>";
    }
    ?>
    </table>
    <?php
}
?>