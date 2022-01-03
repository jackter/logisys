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
    'bom'       => 'bom',
);

/**
 * BOM Store
 */
$Q_BOM = $DB->Query(
    $Table['bom'],
    array(
        'id',
        'kode',
        'description',
        'plant',
        'storeloc',
        'storeloc_kode',
        'storeloc_nama',
        'cost_center_id' => 'cost',
        'cost_center_kode' => 'cost_kode',
        'cost_center_nama' => 'cost_nam'
    ),
    "
        WHERE
            status != 0 AND
            verified = 1
    "
);
$R_BOM = $DB->Row($Q_BOM);
if($R_BOM > 0){
    $i = 0;
    while($BOM = $DB->Result($Q_BOM)){
        $return['bom'][$i] = $BOM;
        $return['bom'][$i]['capacity'] = DEF['prd_capacity'];
        $return['bom'][$i]['shift_total'] = DEF['shift_total'];

        /**
         * Extract Detail
         */
        $Q_Detail = $DB->QueryPort("
            SELECT
                D.item AS id,
                D.qty AS ref_qty,
                TRIM(I.nama) AS nama,
                I.satuan,
                D.tipe,
                I.kode,
                I.in_decimal,
                D.persentase,
                D.cost_center,
                D.cost_center_kode,
                D.cost_center_nama,
                D.coa_alokasi,
                D.coa_alokasi_nama,
                D.coa,
                D.coa_kode,
                D.coa_nama
            FROM
                item AS I,
                " . $Table['bom'] . "_detail AS D
            WHERE
                D.header = '" . $BOM['id'] . "' AND
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
                    $return['bom'][$i]['material'][$im] = $Detail;
                    $im++;
                }elseif($Detail['tipe'] == 2){
                    $return['bom'][$i]['output'][$io] = $Detail;
                    $io++;
                }elseif($Detail['tipe'] == 3){
                    $return['bom'][$i]['utility'][$iu] = $Detail;
                    $iu++;
                }

            }

        }
        //=> / END : Extract Detail

        $i++;
    }
}
//=> / END : BOM Store

echo Core::ReturnData($return);
?>