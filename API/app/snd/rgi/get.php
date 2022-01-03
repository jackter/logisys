<?php
$Modid = 44;

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
    'def'       => 'rgi',
    'detail'    => 'rgi_detail'
);

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
        'kode',
        'gi_kode',
        'tanggal',
        'create_by'
    ),
    "
        WHERE id = '" . $id . "'
    "
);
$R_Data = $DB->Row($Q_Data);

if($R_Data > 0){

    $Data = $DB->Result($Q_Data);

    $return['data'] = $Data;

    $return['data']['tanggal'] = date("D, d M Y", strtotime($Data['tanggal']));

    $return['data']['create_by'] = Core::GetUser("nama", $Data['create_by']);

    //get Enabled Journal
    $Q_Company = $DB->Result($DB->QueryOn(
        DB['master'],
        "company",
        array(
            'journal'
        ),
        "
            WHERE 
                id = '" . $Data['company'] . "'
        "
    ));
    $return['data']['enable_journal'] = $Q_Company['journal'];

    //=> BUSINESS UNIT TITLE 
    $Business = $DB->Result($DB->QueryOn(
        DB['master'],
        "company",
        array(
            'business_unit'
        ),
        "
            WHERE
                id = '".$Data['company']."'
        "
    ));
    $return['data']['business_unit'] = $Business['business_unit'];

    /**
     * detail rgi
     */
    $Q_Detail = $DB->QueryPort("
        SELECT
            D.id AS detail_id,
            D.item AS id_item,
            D.qty_issued,
            D.qty_return,
            D.storeloc,
            D.storeloc_kode,
            D.storeloc_nama,
            D.price,
            D.remarks,
            TRIM(I.nama) AS nama,
            I.satuan,
            I.in_decimal
        FROM
            item AS I,
            " . $Table['detail'] . " AS D
        WHERE
            D.header = '" . $Data['id'] . "' AND
            D.item = I.id
    ");

    $R_Detail = $DB->Row($Q_Detail);
    if($R_Detail > 0){

        $i = 0;
        while($Detail = $DB->Result($Q_Detail)){
    
            $return['data']['list'][$i] = $Detail;

            $return['data']['list'][$i]['qty_issued'] = (int)$Detail['qty_issued'];

            $i++;
        }

    }

}

// >> end listing data

echo Core::ReturnData($return);
?>