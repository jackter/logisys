<?php
$Modid = 201;

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

$return['permissions'] = Perm::Extract($Modid);

$Table = array(
    'def'       => 'jo'
);

/**
 * JO
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
        'storeloc',
        'storeloc_kode',
        'storeloc_nama',
        'plant',
        'kode'
    ),
    "
        WHERE
            id = '" . $id . "'
    "
);
$R_Data = $DB->Row($Q_Data);

if($R_Data > 0) {
    $Data = $DB->Result($Q_Data);
    $return['data'] = $Data;

    /**
     * Get Detail
     */
    $Q_Detail = $DB->QueryPort("
        SELECT
            D.item,
            I.kode as item_kode,
            I.nama as item_nama,
            I.in_decimal
        FROM
            jo_detail D,
            item I
        WHERE
            D.item = I.id AND
            D.tipe = 2 AND
            header = '" . $id . "'
    ");
    $R_Detail = $DB->Row($Q_Detail);

    if($R_Detail > 0) {

        $i = 0;
        while($Detail = $DB->Result($Q_Detail)) {

            $GetStock = App::GetStockItem(array(
                'company'   => $Data['company'],
                'storeloc'  => $Data['storeloc'],
                'item'      => $Detail['item']
            ));

            $return['data']['detail'][$i] = $Detail;

            $return['data']['detail'][$i]['stock'] = $GetStock['stock'];
            $return['data']['detail'][$i]['stock_def'] = $GetStock['stock'];
            $i++;
        }
    }
    //=> END : Get Detail
}
//=> END : JO

echo Core::ReturnData($return);
?>