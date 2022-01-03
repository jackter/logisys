<?php
$Modid = 64;

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
    'def'       => 'prd_tf_deliver',
    'detail'    => 'prd_tf_deliver_detail',
);

/**
 * Get Data
 */
$Q_Data = $DB->Query(
    $Table['def'],
    array(
        "id",
        'id' => 'id_deliver',
        'kode',
        'tanggal',
        'prd',
        'prd_kode',
        'verified',
        'approved',
        'rcv',
        'verified_rcv',
        'approved_rcv'
    ),
    "
        WHERE id = '" . $id . "'
    "
);
$R_Data = $DB->Row($Q_Data);
if($R_Data > 0){
    $Data = $DB->Result($Q_Data);

    $return['data'] = $Data;

    $Reception = 0;
    if($Data['approved'] == 1){
        $Reception = 1;
    }
    
    $return['data']['is_reception'] = $Reception;

    /**
     * Extract Detail
     */
    $Q_Detail = $DB->QueryPort("
        SELECT
            D.id AS id_detail,
            D.item AS id,
            D.qty_ref,
            D.qty_receive,
            D.qty,
            D.price,
            TRIM(I.nama) AS nama,
            I.satuan,
            D.tipe,
            D.remarks,
            D.storeloc,
            D.storeloc_kode,
            D.storeloc_nama,
            I.kode,
            I.in_decimal
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
        $ic = 0;
        while($Detail = $DB->Result($Q_Detail)){

            /**
             * Get St{ock
             */
            if($Reception != 1){
                $GetStock = App::GetStockItem(array(
                    'company'   => $company,
                    'storeloc'  => $Detail['storeloc'],
                    'item'      => $Detail['id']
                ));
                $Detail['stock'] = $GetStock['stock'];
                $Detail['price'] = $GetStock['price'];
            }else{
                $Detail['stock'] = $Detail['qty'];
            }
            //=> / END : Get Stock}

            if(
                $Data['approved'] == 1 && 
                $Detail['qty_receive'] <= 0
            ){
                $Detail['qty_receive'] = null;
            }

            if($Detail['qty'] <= 0){
                $Detail['qty'] = null;
            }

            $Detail['storeloc'] = (int)$Detail['storeloc'];

             //Get data bom
             $BOM_Detail = $DB->Result($DB->Query(
                "bom_detail",
                array(
                    'cost_center',
                    'cost_center_kode',
                    'cost_center_nama',
                    'coa',
                    'coa_kode',
                    'coa_nama',
                    'tipe'
                ),
                "
                    WHERE
                        header = '" .$bom. "' AND
                        item = '". $Detail['id'] ."'
                "
            ));
            //END Get data bom

            if($Detail['tipe'] == 1){
                $return['data']['material'][$im] = $Detail;

                if($BOM_Detail['tipe'] == 1){

                    $return['data']['material'][$im]['cost_center'] = $BOM_Detail['cost_center'];
                    $return['data']['material'][$im]['cost_center_kode'] = $BOM_Detail['cost_center_kode'];
                    $return['data']['material'][$im]['cost_center_nama'] = $BOM_Detail['cost_center_nama'];
                    $return['data']['material'][$im]['coa'] = $BOM_Detail['coa'];
                    $return['data']['material'][$im]['coa_kode'] = $BOM_Detail['coa_kode'];
                    $return['data']['material'][$im]['coa_nama'] = $BOM_Detail['coa_nama'];
                    
                }

                $im++;
            }elseif($Detail['tipe'] == 4){
                $return['data']['list'][$ic] = $Detail;
                $ic++;
            }

        }

    }
    //=> / END : Extract Detail

}
//=> / END : Get Data

echo Core::ReturnData($return);
?>