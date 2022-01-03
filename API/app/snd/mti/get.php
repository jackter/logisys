<?php
$Modid = 130;

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
    'def'       => 'mti',
    'detail'    => 'mti_detail',
    'detail_2'  => 'mto_detail'
);

/**
 * FUNC : Get Storeloc Nama
 */
function GetStoreloc($id){
    // $DB = new DB;
    global $DB;

    $Q_Storeloc = $DB->Query(
        'storeloc',
        array(
            'nama'
        ),
        "
            WHERE 
                id = '" . $id . "'
        "
    );
    $R_Storeloc = $DB->Row($Q_Storeloc);
    if($R_Storeloc > 0){
        $Storeloc = $DB->Result($Q_Storeloc);
    }

    return $Storeloc['nama'];
}
//=> / END : FUNC : Get Storeloc Nama

/**
 * Check Special Logo for Print
 */
// $ShowLogo = array(
//     'CKA',
//     'AMJ',
//     'ENM',
//     'MP',
//     'IJI',
//     'BSG',
//     'NSP'
// );
//=> / END : Check Special Logo For Print

/**
 * Get Data
 */
$Q_Data = $DB->Query(
    $Table['def'],
    array(
        'id',
        'kode',
        'remarks',
        'tanggal',
        'mto',
        'mto_kode',
        'company',
        'company_abbr',
        'company_nama',
        'company_from',
        'company_abbr_from',
        'company_nama_from',
        'from_storeloc',
        'from_storeloc_kode',
        'to_storeloc',
        'to_storeloc_kode',
        'verified',
        'verified_by',
        'verified_date',
        'approved',
        'approved_by',
        'approved_date',
        'create_by',
        'create_date'
    ),
    "
        WHERE id = '" . $id . "'
    "
);
$R_Data = $DB->Row($Q_Data);
if($R_Data > 0){
    $Data = $DB->Result($Q_Data);

    // if(in_array($Data['company_abbr'], $ShowLogo)){
    //     $Data['show_logo'] = 1;
    // }

    $return['data'] = $Data;

    $return['data']['from_storeloc_nama'] = GetStoreloc($Data['from_storeloc']);
    $return['data']['to_storeloc_nama'] = GetStoreloc($Data['to_storeloc']);

    $return['data']['verified_by'] = Core::GetUser("nama", $Data['verified_by']);
    $return['data']['approved_by'] = Core::GetUser("nama", $Data['approved_by']);
    $return['data']['create_by'] = Core::GetUser("nama", $Data['create_by']);

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
     * Extract Detail
     */
    $Q_Detail = $DB->QueryPort("
        SELECT
            D.id AS detail_id,
            D.item AS id,
            D.qty,
            D2.qty AS qty_mto,
            D2.qty_os AS qty_mto_os,
            I.kode AS kode,
            TRIM(I.nama) AS nama,
            I.satuan,
            I.in_decimal
        FROM
            item AS I,
            " . $Table['detail'] . " AS D,
            " . $Table['detail_2'] . " AS D2
        WHERE
            D.header = '" . $id . "' AND
            D2.header = '" . $Data['mto'] . "' AND
            D.item = I.id AND
            D.item = D2.item
    ");
    $R_Detail = $DB->Row($Q_Detail);
    if($R_Detail > 0){
        $i = 0;
        while($Detail = $DB->Result($Q_Detail)){

            $return['data']['list'][$i] = $Detail;

            $i++;

        }
    }
    //=> / END : Extract Detail

}
//=> / END : Get Data

echo Core::ReturnData($return);
?>