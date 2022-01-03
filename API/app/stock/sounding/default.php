<?php
//=> Default Statement
$return = [];
$RPL	= "";
$SENT	= Core::Extract($_POST, $RPL);

//=> Extract Array
if(isset($SENT)){
    foreach($SENT as $KEY => $VAL){	
        $$KEY = $VAL;
    }
}

//=> Company
include "app/_global/company.php";

$Table = array(
    'def'       => 'storeloc',
    'density'   => 'density',
    'calib'     => 'calibrate',
    'fraksi'    => 'fraksi_tank'
);

/**
 * Extract Storeloc
 */
$Q_Storeloc = $DB->Query(
    $Table['def'],
    array(
        'id',
        'company',
        'company_abbr',
        'company_nama',
        'kode',
        'produk',
        'meja_ukur',
        'suhu',
        'kapasitas',
        'nama',
        'tinggi'    => 'tinggi_tank'
    ),
    "
        WHERE
            status != 0 AND
            sounding = 1
        ORDER BY
            nama ASC
    "
);
$R_Storeloc = $DB->Row($Q_Storeloc);
if($R_Storeloc > 0){
    while($Storeloc = $DB->Result($Q_Storeloc)){
        $return['storeloc'][] = $Storeloc;
    }
}
//=> / END : Extract Storeloc

/**
 * Extract Density
 */
$Q_Density = $DB->Query(
    $Table['density'],
    array(
        'id',
        'company',
        'product' => 'produk',
        'suhu',
        'density'
    ),
    "
        WHERE
            status != 0
    "
);
$R_Density = $DB->Row($Q_Density);
if($R_Density > 0){
    while($Density = $DB->Result($Q_Density)){
        $return['density'][] = $Density;
    }
}
//=> / END : Extract Density

/**
 * Extract Calibrate
 */
$Q_Calibrate = $DB->Query(
    $Table['calib'],
    array(
        'id',
        'company',
        'storeloc',
        'high',
        'volume',
        'diff'
    ),
    "
        WHERE
            status != 0
    "
);
$R_Calibrate = $DB->Row($Q_Calibrate);
if($R_Calibrate > 0){
    $i = 0;
    while($Calibrate = $DB->Result($Q_Calibrate)){
        $return['calibrate'][$i] = $Calibrate;
        $return['calibrate'][$i]['high'] = (int)$Calibrate['high'];
        $i++;
    }
}
//=> / END : Extract Calibrate

/**
 * Extract Fraksi Tank
 */
$Q_Fraksi = $DB->Query(
    $Table['fraksi'],
    array(
        'id',
        'company',
        'storeloc',
        'cm_from',
        'cm_to',
        'mm',
        'liter'
    ),
    "
        WHERE
            status != 0
    "
);
$R_Fraksi = $DB->Row($Q_Fraksi);
if($R_Fraksi > 0){
    $i = 0;
    while($Fraksi = $DB->Result($Q_Fraksi)){
        $return['fraksi'][$i] = $Fraksi;
        $i++;
    }
}
//=> / END : Extract Fraksi Tank

/**
 * Extract Data sounding detail 2 bulan
 */
$Q_Sounding = $DB->QueryPort("
    SELECT 
        x.company, 
        x.company_abbr, 
        x.company_nama, 
        x.tanggal, 
        y.storeloc, 
        y.storeloc_kode, 
        y.storeloc_nama, 
        y.weight 
    FROM 
        sounding x, 
        sounding_detail y
    WHERE 
        x.id = y.header AND 
        DATE_FORMAT(x.tanggal, '%Y-%m') in (DATE_FORMAT(now(), '%Y-%m'), DATE_FORMAT(DATE_SUB(now(), INTERVAL 1 MONTH), '%Y-%m'))
    ORDER BY x.tanggal DESC
");
$R_Sounding = $DB->Row($Q_Sounding);
if($R_Sounding > 0){
    while($Sounding = $DB->Result($Q_Sounding)){
        $return['sounding'][] = $Sounding;
    }
}
//=>END Extract Data sounding detail 2 bulan

echo Core::ReturnData($return);
?>