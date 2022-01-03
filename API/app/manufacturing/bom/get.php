<?php
$Modid = 59;

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
    'def'       => 'bom',
    'detail'    => 'bom_detail'
);

/**
 * Get Data
 */
$Q_Data = $DB->Query(
    $Table['def'],
    array(
        'id',
        'kode',
        'storeloc',
        'storeloc_kode',
        'storeloc_nama',
        'plant',
        'description',
        'verified',
        'cost_center_id' => 'cost',
        'cost_center_kode' => 'cost_kode',
        'cost_center_nama' => 'cost_nama'
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
     * Extract Detail
     */
    $Q_Detail = $DB->QueryPort("
        SELECT
            D.item AS id,
            D.qty,
            TRIM(I.nama) AS nama,
            I.satuan,
            D.tipe,
            I.kode,
            I.in_decimal,
            D.persentase,
            D.cost_center,
            D.cost_center_kode,
            D.cost_center_nama,
            D.job_alocation,
            D.job_alocation_nama,
            D.coa_alokasi,
            D.coa_alokasi_nama,
            D.coa,
            D.coa_kode,
            D.coa_nama
        FROM
            item AS I,
            " . $Table['detail'] . " AS D
        WHERE
            D.header = '" . $id . "' AND
            D.item = I.id
        ORDER BY
            tipe ASC
    ");
    $R_Detail = $DB->Row($Q_Detail);
    if($R_Detail > 0){
        $im = 0;
        $io = 0;
        $iu = 0;

        while($Detail = $DB->Result($Q_Detail)){

            if($Detail['tipe'] == 1){
                $return['data']['material'][$im] = $Detail;
                $im++;
            }elseif($Detail['tipe'] == 2){
                $return['data']['output'][$io] = $Detail;
                $io++;
            }elseif($Detail['tipe'] == 3){
                $return['data']['utility'][$iu] = $Detail;
                $iu++;
            }

        }

        if(!$is_detail){
            $return['data']['material'][$im] = array(
                'i' => 0
            );
            $return['data']['output'][$io] = array(
                'i' => 0
            );
            $return['data']['utility'][$iu] = array(
                'i' => 0
            );
        }
    }
    //=> / END : Extract Detail

}
//=> / END : Get Data

echo Core::ReturnData($return);
?>