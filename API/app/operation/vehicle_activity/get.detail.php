<?php 
$Modid = 137;

Perm::Check($Modid, 'view');

/* Default Statement */
$return = [];
$RPL = "";
$SENT = Core::Extract($_POST, $RPL);

/* Extract Array */
if (isset($SENT)) {
    foreach ($SENT as $KEY => $VAL) {
        $$KEY = $VAL;
    }
}

$Table = array(
    'def'   => 'vehicle_master',
    'coa'   => 'coa_master',
    'tipe'  => 'vehicle_loadtype'
);

/**
 * Get Data
 */
$Q_Data = $DB->Query(
    $Table['def'],
    array(
        'id',
        'kode',
        'company',
        'company_abbr',
        'company_nama',
        'vgrup',
        'vgrup_abbr',
        'vgrup_nama'
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

    $Q_COA = $DB->Query(
        $Table['coa'],
        array(
            'id',
            'kode',
            'nama',
            'company'
        ),
        "
            WHERE
                company = '" . $Data['company'] . "'
            ORDER BY
                nama
        "
    );
    $R_COA = $DB->Row($Q_COA);

    if($R_COA > 0) {
        
        $i = 0;
        while($COA = $DB->Result($Q_COA)) {

            $return['coa'][$i] = $COA;
            $i++;
        }
    }
    
}
//=> END : Get Data

/**
 * Get LoadType
 */
$Q_Type = $DB->Query(
    $Table['tipe'],
    array(
        'id',
        'abbr',
        'nama',
        'uom'
    ),
    "
        ORDER BY
            nama
    "
);
$R_Type = $DB->Row($Q_Type);

if($R_Type > 0) {

    $i = 0;
    while($Type = $DB->Result($Q_Type)) {

        $return['tipe'][$i] = $Type;
        $i++;
    }
}
//=> END : Get LoadType

echo Core::ReturnData($return);

?>