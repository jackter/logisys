<?php
$Modid = 84;

Perm::Check($Modid, 'view');

#Default Statement
$return = [];
$RPL    = "";
$SENT   = Core::Extract($_POST, $RPL);

#Extract Array
if (isset($SENT)) {
    foreach ($SENT as $KEY => $VAL) {
        $$KEY = $VAL;
    }
}

#Get Data
$Q_Data = $DB->QueryOn(
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
            id = '" . $id . "'
    "
);

$R_Data = $DB->Row($Q_Data);

if ($R_Data > 0) {

    $Data = $DB->Result($Q_Data);
    
    $return['data'] = $Data;

    $Q_Company = $DB->QueryOn(
        DB['master'],
        "company",
        array(
            'id',
            'abbr',
            'nama'
        ),
        "
            WHERE 
                id = '" . $Data['company'] . "'
        "
    );
    $R_Company = $DB->Row($Q_Company);

    if ($R_Company > 0) {

        $Company = $DB->Result($Q_Company);
        $return['data']['company_nama'] = $Company['nama'];

    }
}

echo Core::ReturnData($return);

?>
