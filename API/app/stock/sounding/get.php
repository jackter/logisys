<?php
$Modid = 123;
Perm::Check($Modid, 'view');

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
    'def'       => 'sounding',
    'detail'    => 'sounding_detail'
);

/**
 * Get Data
 */
$Q_Data = $DB->Query(
    $Table['def'],
    array(
        'id',
        'tanggal',
        'company',
        'company_abbr',
        'company_nama',
        'remarks',
        'approved'
    ),
    "
        WHERE 
            id = '" . $id . "'
    "
);
$R_Data = $DB->Row($Q_Data);

if($R_Data > 0) {
    $Data = $DB->Result($Q_Data);
    $return['data'] = $Data;

    //=> BUSINESS UNIT TITLE 
    $Business = $DB->Result($DB->QueryOn(
        DB['master'],
        "company",
        array(
            'business_unit'
        ),
        "
            WHERE
                id = '" . $Data['company'] . "'
        "
    ));
    $return['data']['business_unit'] = $Business['business_unit'];

    /**
     * Get Detail
     */
    $Q_Detail = $DB->Query(
        $Table['detail'],
        array(
            'produk',
            'storeloc'          => 'id',
            'storeloc_kode'     => 'kode',
            'storeloc_nama'     => 'nama',    
            'tinggi',
            'tinggi_meja',
            'tabel',
            'temp',
            'density',
            'faktor_koreksi',
            'volume',
            'weight',
            'remarks'
        ),
        "
            WHERE
                header = '" . $id . "'
        "
    );
    $R_Detail = $DB->Row($Q_Detail);

    if($R_Detail > 0) {
        
        while($Detail = $DB->Result($Q_Detail)) {
            $return['data']['list'][] = $Detail;
        }
    }
    //=> END : Get Detail
}
//=> END : Get Data

echo Core::ReturnData($return);
?>
