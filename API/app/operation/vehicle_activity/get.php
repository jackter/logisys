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
    'def'   => 'vehicle_activity'
);

/**
 * Get Data
 */
$Q_Data = $DB->Query(
    $Table['def'],
    array(
        'id',
        'tanggal',
        'vehicle',
        'vgrup',
        'vgrup_abbr',
        'vgrup_nama',
        'waktu_start',
        'waktu_end',
        'total_waktu',
        'jarak_start',
        'jarak_end',
        'total_jarak',
        'coa',
        'coa_kode',
        'coa_nama',
        'muatan',
        'muatan_abbr',
        'muatan_nama',
        'qty',
        'uom',
        'keterangan',
        'approved'
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