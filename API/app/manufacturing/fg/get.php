<?php
$Modid = 65;

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
    'def'       => 'transfer_fg',
    'detail'    => 'transfer_fg_detail',
    'storeloc'  => 'storeloc',
    'stock'     => 'storeloc_stock'
);

/**
 * Get Data
 */
$Q_Data = $DB->Query(
    $Table['def'],
    array(
        'id',
        'kode',
        'company',
        'company_abbr',
        'company_nama',
        'dept',
        'dept_abbr',
        'dept_nama',
        'storeloc',
        'storeloc_kode',
        'storeloc_nama',
        'remarks'   => 'note',
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
            D.qty AS qty_send,
            D.storeloc,
            D.storeloc_kode,
            D.storeloc_nama,
            D.qty_receive,
            TRIM(I.nama) AS nama,
            I.satuan,
            I.kode,    
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
        $j = 0;

        while($Detail = $DB->Result($Q_Detail)){

            $return['data']['output'][$j] = $Detail;

            if($Detail['storeloc'] == 0){

                $return['data']['output'][$j]['storeloc'] = null;
            }


             /**
             * Get Stock
             */
            $GetStock = App::GetStockItem(array(
                'company'   => DEF['company'],
                'storeloc'  => $Data['storeloc'],
                'item'      => $Detail['id']
            ));
            $return['data']['output'][$j]['stock'] = (int)$GetStock['stock'];
            $return['data']['output'][$j]['stock_def'] = (int)$GetStock['stock'];
            $return['data']['output'][$j]['price'] = (int)$GetStock['price'];
            //=> / END : Get Stock

            /**
             * Get Stock by list storeloc
             */
            $GetStock = App::GetStockItem(array(
                'company'   => DEF['company'],
                'storeloc'  => $Detail['storeloc'],
                'item'      => $Detail['id']
            ));
            $return['data']['output'][$j]['stock2'] = (int)$GetStock['stock'];
            /**
             * Get Storloc Stock
             */
            $Q_SStock = $DB->QueryPort("
                SELECT
                        H.id storeloc,
                        H.kode storeloc_kode,
                        H.nama AS storeloc_nama,
                        IFNULL((SELECT D.stock FROM storeloc_stock AS D WHERE D.item = '" . $Detail['id'] . "' AND D.company = H.company AND D.storeloc = H.id), 0) AS stock,
                        IFNULL((SELECT D.price FROM storeloc_stock AS D WHERE D.item = '" . $Detail['id'] . "' AND D.company = H.company AND D.storeloc = H.id), 0) AS price_receive
                FROM
                        storeloc AS H
                WHERE
                        H.company = '" . $Data['company'] . "'
                ORDER BY H.kode, stock DESC
            ");
            $R_SStock = $DB->Row($Q_SStock);
            if($R_SStock > 0){
                $i = 0;
                while($SStock = $DB->Result($Q_SStock)){

                    $return['data']['output'][$j]['storeloc_list'][$i] = $SStock;

                    $i++;

                }
            }
            //=> End Get  Storeloc Stock

            $j++;
        }
    }
    //=> / END : Extract Detail

}
//=> / END : Get Data

echo Core::ReturnData($return);
?>