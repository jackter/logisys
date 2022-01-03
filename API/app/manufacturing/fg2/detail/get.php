<?php
$Modid = 201;
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
    'def'       => 'prd_transfer_fg',
    'detail'    => 'prd_transfer_fg_detail',
);

$Q_Data = $DB->Query(
    $Table['def'],
    array(
        'id',
        'kode',
        'tanggal',
        'company',
        'company_abbr',
        'company_nama',
        'dept',
        'dept_abbr',
        'dept_nama',
        'jo',
        'jo_kode',
        'remarks',
        'verified',
        'approved',
        'approved_rcv'
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
            D.id,
            D.tipe,
            D.item,
            I.nama as item_nama,
            I.kode as item_kode,
            I.in_decimal,
            D.storeloc,
            D.storeloc_kode,
            D.storeloc_nama,
            D.jo,
            D.jo_kode,
            D.stock,
            D.qty,
            D.remarks
        FROM
            prd_transfer_fg_detail D,
            item I
        WHERE
            D.header = '" . $id . "' AND
            D.item = I.id
    ");
    $R_Detail = $DB->Row($Q_Detail);

    if($R_Detail > 0) {

        $i = 0;
        while($Detail = $DB->Result($Q_Detail)) {

            $return['data']['detail'][$i] = $Detail;

            if ($Detail['tipe'] == 1) {
                $return['data']['detail'][$i]['destination'] = $Detail['storeloc'];
                $return['data']['detail'][$i]['destination_kode'] = $Detail['storeloc_kode'];
            } else {
                $return['data']['detail'][$i]['destination'] = $Detail['jo'];
                $return['data']['detail'][$i]['destination_kode'] = $Detail['jo_kode'];
            }

            if(!$is_detail) {
                $GetStock = App::GetStockItem(array(
                    'company'   => $Data['company'],
                    'storeloc'  => $storeloc,
                    'item'      => $Detail['item']
                ));

                $return['data']['detail'][$i]['stock'] = $GetStock['stock'];
                $return['data']['detail'][$i]['stock_def'] = $GetStock['stock'];
            }

            $i++;
        }
    }
    //=> END : Get Detail
}

echo Core::ReturnData($return);
?>