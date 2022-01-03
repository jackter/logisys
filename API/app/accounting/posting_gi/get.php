<?php
$Modid = 50;

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
    'def'       => 'gi',
    'detail'    => 'gi_detail',
    'mr'        => 'mr',
    'mr_detail' => 'mr_detail'
);

/**
 * Get Data
 */
$Q_Data = $DB->Query(
    $Table['def'],
    array(
        'id',
        'company',
        'company_abbr',
        'company_nama',
        'dept',
        'dept_abbr',
        'dept_nama',
        'cost_center',
        'cost_center_kode',
        'cost_center_nama',
        'jurnal',
        'kode',
        'mr',
        'mr_kode',
        'remarks',
        'tanggal',
        'status'
    ),
    "
        WHERE id = '" . $id . "'
    "
);
$R_Data = $DB->Row($Q_Data);
if($R_Data > 0){
    $Data = $DB->Result($Q_Data);

    $return['data'] = $Data;

    /**
     * Detail GI
     */
    $Q_Detail = $DB->QueryPort("
        SELECT
            H.kode AS gi_kode,
            H.company,
            H.tanggal,
            D.id AS detail_id,
            D.item AS id,
            D.qty_mr,
            D.qty_gi,
            D.qty_return,
            D.price,
            D.storeloc,
            D.storeloc_kode,
            D.storeloc_nama,
            D.cost_center,
            D.cost_center_kode,
            D.cost_center_nama,
            MD.qty_approved,
            MD.qty_outstanding,
            MD.remarks,
            I.kode AS kode,
            TRIM(I.nama) AS nama_item,
            I.satuan,
            I.item_type,
            I.sub_item_type,
            I.in_decimal,
            IC.coa_hpp AS coa, 
            IC.coa_kode_hpp AS coa_kode, 
            IC.coa_nama_hpp AS nama
        FROM
            " . $Table['def'] . " AS H,
            " . $Table['detail'] . " AS D,
            " . $Table['mr'] . " AS M,
            " . $Table['mr_detail'] . " AS MD,
            item AS I LEFT JOIN item_coa AS IC ON I.id = IC.item_id AND IC.company = ". $company ."
        WHERE
            H.id = ' " . $id . "' AND
            H.id = D.header AND
            M.id = MD.header AND
            H.mr = M.id AND
            D.item = MD.item AND
            D.item = I.id AND
            I.item_type in (0, 1)
    ");
    $R_Detail = $DB->Row($Q_Detail);

    if($R_Detail > 0){
        $j = 0;
        while($Detail = $DB->Result($Q_Detail)){

            $return['data']['list'][$j] = $Detail;

            $j++;
        }
    }
    // => End Detail GI

}
//=> / END : Get Data

echo Core::ReturnData($return);
?>