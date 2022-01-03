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
         * Storelocation has Stock
         */
        /*$Q_Store = $DB->Query(
            "storeloc",
            array(
                'id',
                'kode',
                'nama'
            ),
            "
                WHERE
                    company = '" .  $Instore['id'] . "'
                GROUP BY

            "
        );*/
        $Q_Store = $DB->QueryPort("
            SELECT
                S.id,
                S.kode,
                S.nama
            FROM
                storeloc AS S,
                storeloc_stock AS SS
            WHERE
                SS.storeloc = S.id AND 
                SS.stock > 0 AND 
                SS.company = '" . $Instore['id'] . "'
            GROUP BY
                SS.storeloc
        ");
        $R_Store = $DB->Row($Q_Store);
        if($R_Store > 0){
            $j = 0;
            $IDs = [];
            while($Store = $DB->Result($Q_Store)){

                $return['company'][$i]['store'][$j] = $Store;

                $IDs[] = $Store['id'];

                $j++;

            }

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

                    $return['company'][$i]['store_all'][$j] = $Store;

                    $j++;

                }
            }
            //=> / END : Storelocation

        }
        //=> / END : Storelocation has Stock

        $i++;
    }
}
//=> / END : Instore In Store
?>