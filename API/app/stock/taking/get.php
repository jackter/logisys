<?php
$Modid = 38;

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
    'def'       => 'stock_taking',
    'detail'    => 'stock_taking_detail'
);

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
        'company',
        'company_abbr',
        'company_nama',
        'storeloc',
        'storeloc_kode',
        'storeloc_nama',
        'verified',
        'approved',
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

    $return['data'] = $Data;

    /**
     * Extract Detail
     */
    $Q_Detail = $DB->QueryPort("
        SELECT
            D.id AS detail_id,
            D.item AS id,
            D.stock,
            D.actual AS qty,
            D.price,
            D.selisih,
            D.jurnal,
            D.qty_jurnal,
            I.kode AS kode,
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

            if($Data['approved'] != 1){
                $Stock = App::GetStockItem(array(
                    'company'       => $Data['company'],
                    'storeloc'      => $Data['storeloc'],
                    'item'          => $Detail['id']
                ));

                $return['data']['list'][$i]['stock'] = $Stock['stock'];
                $return['data']['list'][$i]['price'] = $Stock['price'];
                $return['data']['list'][$i]['selisih'] = $Detail['qty'] - $Stock['stock'];
            }

            $i++;

        }
    }
    if(!$is_detail){
        $return['data']['list'][$i] = array(
            'i' => $i
        );
    }
    //=> / END : Extract Detail


}
//=> / END : Get Data

echo Core::ReturnData($return);
?>