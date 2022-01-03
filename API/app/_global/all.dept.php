<?php
/**
* Department
*/
$Q_Dept = $DB->QueryOn(
    DB['master'],
    "dept",
    array(
        'id',
        'company',
        'abbr',
        'nama'
    ),
    "
        WHERE
            status != 0
    "
);
$R_Dept = $DB->Row($Q_Dept);
if($R_Dept > 0){
    $j = 0;
    while($Dept = $DB->Result($Q_Dept)){

        $return['all_dept'][$j] = $Dept;

        $Company = $DB->Result($DB->QueryOn(
            DB['master'],
            "company",
            array(
                'id',
                'abbr',
                'nama'
            ),
            "
                WHERE
                    id = '" . $Dept['company'] . "'
            "
        ));

        $return['all_dept'][$j]['company_abbr'] = $Company['abbr'];
        $return['all_dept'][$j]['company_nama'] = $Company['nama'];

        $j++;

    }
}
//=> / END : Department
?>