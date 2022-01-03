<?php
$Modid = 26;

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
    'def'       => 'initial_stock',
    'detail'    => 'initial_stock_detail'
);

/**
 * Get Data
 */
$Q_Data = $DB->Query(
    $Table['def'],
    array(
        'id',
        'kode',
        'tanggal',
        'company',
        'company_abbr',
        'company_nama',
        'storeloc',
        'storeloc_kode',
        'storeloc_nama',
        'description',
        'verified',
        'approved'
    ),
    "
        WHERE id = '" . $id . "'
    "
);
$R_Data = $DB->Row($Q_Data);
if($R_Data > 0){
    $Data = $DB->Result($Q_Data);

    $return['data'] = $Data;

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

    /**
     * Extract Detail
     */
    $Q_Detail = $DB->QueryPort("
        SELECT
            D.item AS id,
            D.qty,
            D.price,
            TRIM(I.nama) AS nama,
            I.satuan,
            I.in_decimal
        FROM
            item AS I,
            " . $Table['detail'] . " AS D
        WHERE
            D.header = '" . $id . "' AND
            D.item = I.id
    ");
    $R_Detail = $DB->Row($Q_Detail);
    if($R_Detail > 0){
        $i = 0;
        while($Detail = $DB->Result($Q_Detail)){
            $return['data']['list'][$i] = $Detail;

            $i++;
        }

        if(!$is_detail){
            $return['data']['list'][$i] = array(
                'i' => 0
            );
        }
    }
    //=> / END : Extract Detail

}
//=> / END : Get Data

echo Core::ReturnData($return);
?>