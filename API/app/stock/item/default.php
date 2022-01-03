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

$Table = array(
    'def'      => 'item',
    'satuan'   => 'item_satuan',
    'grup'     => 'item_grup',
    'coa'      => 'coa_master',
    'company'  => 'company'
);

/**
 * Extract Satuan
 */
$Q_Satuan = $DB->Query(
    $Table['satuan'],
    array(
        'id',
        'kode',
        'nama'
    ),
    "
        WHERE
            status != 0
        ORDER BY
            kode ASC
    "
);
$R_Satuan = $DB->Row($Q_Satuan);
if($R_Satuan > 0){
    while($Satuan = $DB->Result($Q_Satuan)){
        $return['satuan'][] = $Satuan;
    }
}
//=> / END : Extract Satuan

/**
 * Extract Grup
 */
$Q_Grup = $DB->Query(
    $Table['grup'],
    array(
        'id',
        'kode',
        'nama'
    ),
    "
        WHERE
            status != 0
        ORDER BY
            kode ASC
    "
);
$R_Grup = $DB->Row($Q_Grup);
if($R_Grup > 0){
    while($Grup = $DB->Result($Q_Grup)){
        $return['grup'][] = $Grup;
    }
}
//=> / END : Extract Grup

/**
 * Brand
 * 
 * Seluruh Brand dari Group
 */
$Q_Brand = $DB->Query(
    $Table['def'],
    array(
        'brand' => 'nama'
    ),
    "
        WHERE
            brand IS NOT NULL && 
            brand != ''
        GROUP BY
            brand
        ORDER BY
            brand ASC
    "
);
$R_Brand = $DB->Row($Q_Brand);
if($R_Brand > 0){
    while($Brand = $DB->Result(($Q_Brand))){
        $return['brand'][] = $Brand;
    }
}
//=> Brand

/**
 * Extract COA
 */
$Q_COA = $DB->Query(
    $Table['coa'],
    array(
        'id',
        'company',
        'kode',
        'nama'
    ),
    "
        WHERE
            status != 0
            AND is_h = 0
        ORDER BY
            kode ASC
    "
);
$R_COA = $DB->Row($Q_COA);
if($R_COA > 0){
    while($COA = $DB->Result($Q_COA)){
        $return['coa'][] = $COA;
    }
}
//=> / END : Extract COA

/**
 * Get Company
 */
$CLAUSE = "
    WHERE 
        id != ''
";

$PermCompany = Core::GetState('company');
if($PermCompany != "X"){
    $CLAUSE .= " AND id IN (" . $PermCompany . ")";
}

$Q_Company = $DB->QueryOn(
    DB['master'],
    $Table['company'],
    array(
        'id',
        'abbr',
        'nama'
    ),
    $CLAUSE .
    "
        ORDER BY
            nama ASC
    "
);
$R_Company = $DB->Row($Q_Company);

if($R_Company > 0){

    $i = 0;
    while($Company = $DB->Result($Q_Company)){

        $return['company'][$i] = $Company;

        $i++;
    }
}
//=> / END : Get Company

echo Core::ReturnData($return);
?>