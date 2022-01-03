<?php
$Modid = 37;

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
    'def'       => 'mt',
    'detail'    => 'mt_detail'
);

/**
 * FUNC : Get Storeloc Nama
 */
function GetStoreloc($id){
    // $DB = new DB;
    global $DB;

    $Q_Storeloc = $DB->Query(
        'storeloc',
        array(
            'nama'
        ),
        "
            WHERE 
                id = '" . $id . "'
        "
    );
    $R_Storeloc = $DB->Row($Q_Storeloc);
    if($R_Storeloc > 0){
        $Storeloc = $DB->Result($Q_Storeloc);
    }

    return $Storeloc['nama'];
}
//=> / END : FUNC : Get Storeloc Nama

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
        'from_storeloc',
        'from_storeloc_kode',
        'to_storeloc',
        'to_storeloc_kode',
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

    $return['data']['from_storeloc_nama'] = GetStoreloc($Data['from_storeloc']);
    $return['data']['to_storeloc_nama'] = GetStoreloc($Data['to_storeloc']);

    /**
     * Extract Detail
     */
    $Q_Detail = $DB->QueryPort("
        SELECT
            D.id AS detail_id,
            D.item AS id,
            D.qty,
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

            $Stock = App::GetStockItem(array(
                'company'       => $Data['company'],
                'storeloc'      => $Data['from_storeloc'],
                'item'          => $Detail['id']
            ));

            $return['data']['list'][$i]['stock'] = $Stock['stock'] - $Detail['qty'];
            $return['data']['list'][$i]['stock_def'] = $Stock['stock'];
            $return['data']['list'][$i]['price'] = $Stock['price'];

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