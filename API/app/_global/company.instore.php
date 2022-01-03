<?php
$PermCompany = Core::GetState('company');
if($PermCompany == "X"){
    $CLAUSE_COMPANY = "";
    $CLAUSE_STORE = "";
}else{
    $CLAUSE_COMPANY = " AND id IN (" . $PermCompany . ")";
    $CLAUSE_STORE = " AND company IN (" . $PermCompany . ")";
}

/**
 * Company In Store
 */
$Q_Instore = $DB->Query(
    "storeloc",
    array(
        'company'       => 'id',
        'company_abbr'  => 'abbr',
        'company_nama'  => 'nama'
    ),
    "
        WHERE
            status != 0
            $CLAUSE_STORE
        GROUP BY
            company
        ORDER BY
            abbr ASC,
            nama ASC
    "
);
$R_Instore = $DB->Row($Q_Instore);

if($R_Instore > 0){
    $i = 0;
    while($Instore = $DB->Result($Q_Instore)){
        $return['company'][$i] = $Instore;

        /**
         * Storelocation
         */
        $Q_Store = $DB->Query(
            "storeloc",
            array(
                'id',
                'kode',
                'nama'
            ),
            "
                WHERE
                    company = '" .  $Instore['id'] . "'
            "
        );
        $R_Store = $DB->Row($Q_Store);
        if($R_Store > 0){
            $j = 0;
            while($Store = $DB->Result($Q_Store)){

                $return['company'][$i]['store'][$j] = $Store;

                $j++;

            }
        }
        //=> / END : Storelocation

        $i++;
    }
}
//=> / END : Instore In Store
?>