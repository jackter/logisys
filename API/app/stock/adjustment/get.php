<?php
$Modid = 66;

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
    'def'       => 'stock_adjustment',
    'detail'    => 'stock_adjustment_detail'
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
        'adj_qty',
        'adj_value',
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

    $Q_Detail = $DB->QueryPort("
        SELECT
            D.id AS detail_id,
            D.item AS id,
            D.price,
            D.debit,
            D.credit,
            I.kode AS kode,
            TRIM(I.nama) AS nama,
            I.satuan,
            I.in_decimal,
            I.grup,
            I.grup_nama
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

            if($Detail['debit'] > 0){
                $return['data']['list'][$i]['qty'] = $Detail['debit'];
            }
            else{
                $return['data']['list'][$i]['qty'] = $Detail['credit'] * -1;
            }

            $i++;
        }
    }
    if(!$is_detail){
        $return['data']['list'][$i] = array(
            'i' => $i
        );
    }

    //get Enabled Journal
    // $Q_Company = $DB->Result($DB->QueryOn(
    //     DB['master'],
    //     "company",
    //     array(
    //         'journal',
    //         'business_unit'
    //     ),
    //     "
    //         WHERE 
    //             id = '" . $Data['company'] . "'
    //     "
    // ));
    // $return['data']['enable_journal'] = $Q_Company['journal'];
    // $return['data']['business_unit'] = $Q_Company['business_unit'];

    // $return['data']['adj_qty'] = (int)$Data['adj_qty'];
    // $return['data']['adj_value'] = (int)$Data['adj_value'];

    // /**
    //  * Extract Detail
    //  */
    // $Q_Detail = $DB->QueryPort("
    //     SELECT
    //         D.id AS detail_id,
    //         D.item AS id,
    //         D.stock,
    //         D.price,

    //         D.actual AS qty,
    //         D.selisih,
    //         D.jurnal,
    //         D.qty_jurnal,

    //         D.current_val,
    //         D.val,
    //         D.selisih_val,
    //         D.jurnal_acc,
    //         D.val_jurnal_acc,

    //         D.price_new,
    //         D.price_stock AS price_new_stock,

    //         D.coa,
    //         D.coa_kode,
    //         D.coa_nama,

    //         I.kode AS kode,
    //         TRIM(I.nama) AS nama,
    //         I.satuan,
    //         I.item_type,
    //         I.grup,
    //         I.grup_nama,
    //         I.in_decimal
    //     FROM
    //         item AS I,
    //         " . $Table['detail'] . " AS D
    //     WHERE
    //         D.header = '" . $id . "' AND
    //         D.item = I.id
    // ");
    // $R_Detail = $DB->Row($Q_Detail);
    // if($R_Detail > 0){
    //     $i = 0;
    //     while($Detail = $DB->Result($Q_Detail)){

    //         $return['data']['list'][$i] = $Detail;

    //         if($Data['approved'] != 1){
    //             $Stock = App::GetStockItem(array(
    //                 'company'       => $Data['company'],
    //                 'storeloc'      => $Data['storeloc'],
    //                 'item'          => $Detail['id']
    //             ));

    //             $return['data']['list'][$i]['stock'] = $Stock['stock'];
    //             $return['data']['list'][$i]['price'] = $Stock['price'];
    //             $return['data']['list'][$i]['selisih'] = $Detail['qty'] - $Stock['stock'];
    //         }

    //         $i++;

    //     }
    // }
    // if(!$is_detail){
    //     $return['data']['list'][$i] = array(
    //         'i' => $i
    //     );
    // }
    //=> / END : Extract Detail


}
//=> / END : Get Data

echo Core::ReturnData($return);
?>