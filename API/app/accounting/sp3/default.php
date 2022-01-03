<?php
//=> Default Statement
$return = [];
$RPL    = "";
$SENT    = Core::Extract($_POST, $RPL);

//=> Extract Array
if (isset($SENT)) {
    foreach ($SENT as $KEY => $VAL) {
        $$KEY = $VAL;
    }
}

/**
 * Company
 * 
 * Get data company
 */
$PermCompany = Core::GetState('company');
if ($PermCompany == "X") {
    $CLAUSE = "";
} else {
    $CLAUSE = " AND id IN (" . $PermCompany . ")";
}

$Q_Company = $DB->QueryOn(
    DB['master'],
    "company",
    array(
        'id',
        'nama',
        'abbr',
        'grup'
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

if ($R_Company > 0) {
    $i = 0;
    while ($Company = $DB->Result($Q_Company)) {

        $return['company'][$i] = $Company;

        /**
         * Get Grup
         */
        $Q_Grup = $DB->QueryOn(
            DB['master'],
            "company_grup",
            array(
                'nama'
            ),
            "
                WHERE
                    id = '" . $Company['grup'] . "'
            "
        );
        $R_Grup = $DB->Row($Q_Grup);

        if ($R_Grup > 0) {

            $Grup = $DB->Result($Q_Grup);

            $return['company'][$i]['grup_nama'] = $Grup['nama'];
        }
        //=> END : Get Grup

        $i++;
    }
}
//=> / END : Company

/**
 * Extract Cur
 */
$Q_Cur = $DB->Query(
    'cur',
    array(
        'id',
        'kode',
        'nama',
        'country'
    ),
    "
        WHERE
            status != 0
        ORDER BY
            id ASC
    "
);
$R_Cur = $DB->Row($Q_Cur);
if ($R_Cur > 0) {
    while ($Cur = $DB->Result($Q_Cur)) {
        $return['cur'][] = $Cur;
    }
}
//=> / END : Extract Cur

echo Core::ReturnData($return);

?>