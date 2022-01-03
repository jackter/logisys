<?php
$Q_Cost = $DB->Query(
    "cost_center",
    array(
        'id',
        'kode',
        'nama',
        'company',
        'company_abbr',
        'company_nama'
    ),
    "
        WHERE
            status != 0
    "
);
$R_Cost = $DB->Row($Q_Cost);
if($R_Cost > 0){
    $j = 0;
    while($Cost = $DB->Result($Q_Cost)){

        $return['all_cost_center'][$j] = $Cost;

        $j++;

    }
}
?>