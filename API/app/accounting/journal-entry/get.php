<?php
$Modid = 51;

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
    'def'       => 'jv',
    'detail'    => 'jv_detail'
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
        'tanggal',
        'kode',
        'total_credit' => 'creditTotal',
        'total_debit' => 'debitTotal',
        'note',
        'ref_type',
        'jv_type',
        'verified',
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
    $Q_Detail = $DB->Query(
        $Table['detail'],
        array(
            'id'        => 'id_detail',
            'ref_cip',
            'ref_cip_kode',
            'coa'       => 'id',
            'coa_kode'  => 'kode',
            'coa_nama'  => 'nama',
            'debit',
            'credit',
            'keterangan' => 'memo'
        ),
        "
            WHERE
                header = '".$id."'
        "
    );
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