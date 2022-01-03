<?php
/**
 * Company
 * 
 * Get data company
 */
$PermCompany = Core::GetState('company');
if($PermCompany == "X"){
    $CLAUSE = "";
}else{
    $CLAUSE = " AND id IN (" . $PermCompany . ")";
}

/*$PermDept = Core::GetState('dept');
if($PermDept == "X"){
    $CLAUSE_DEPT = "";
}else{
    if(!empty($PermUsers)){
        $CLAUSE_DEPT .= " AND create_by IN (" . $PermUsers . ")";
    }else{
        $CLAUSE_DEPT .= " AND create_by = '" . Core::GetState('id') . "'";
    }
}*/

$Q_Company = $DB->QueryOn(
    DB['master'],
    "company",
    array(
        'id',
        'nama',
        'abbr',
        'alamat'
    ),
    "
    WHERE 
        status != 0
        " . $CLAUSE . "
    ORDER BY
        abbr ASC, 
        nama ASC
    "
);
$R_Company = $DB->Row($Q_Company);

if($R_Company > 0){
    $i = 0;
    while($Company = $DB->Result($Q_Company)){
        $return['company'][$i] = $Company;

        /**
         * Department
         */
        $PermDept = Core::GetState('dept');
        $CLAUSE = "";
        if($PermDept != "X" && !empty($PermDept)){
            $CLAUSE .= " AND id IN (" . $PermDept . ")";
        }
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
                    company = '" .  $Company['id'] . "'
                    $CLAUSE
            "
        );
        $R_Dept = $DB->Row($Q_Dept);
        if($R_Dept > 0){
            $j = 0;
            while($Dept = $DB->Result($Q_Dept)){

                $return['company'][$i]['dept'][$j] = $Dept;

                $j++;

            }
        }
        //=> / END : Department

        $i++;
    }
}
//=> / END : Company
?>