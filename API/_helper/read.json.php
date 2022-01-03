<?php
$Table = array(
    'def'       => 'initial_stock'
);

$Q_Initial = $DB->Query(
    $Table['def'],
    array(),
    "WHERE id = 1"
);
$R_Initial = $DB->Row($Q_Initial);
if($R_Initial > 0){
    $Initial = $DB->Result($Q_Initial);

    $history = json_decode($Initial['history'], true);

    echo "<pre>";
    print_r($history);
    echo "</pre>";
}
?>