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
    'def'   => 'vehicle_master'
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
        'vgrup_nama',
        'nopol',
        'tahun_pembuatan',
        'tahun_pemakaian',
        'model',
        'no_mesin',
        'no_chasis',
        'no_kir',
        'permissions',
        'keterangan',
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
    
}
//=> END : Get Data

echo Core::ReturnData($return);

?>