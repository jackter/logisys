<?php

$Modid = 195;

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
    'jo'        => 'jo',
    'detail'    => 'jo_detail',
);

$CLAUSE = "
    WHERE
        id != '' AND
";

$return['permissions'] = Perm::Extract($Modid);

/**
 * Get JO
 */
$Q_JO = $DB->Query(
    $Table['jo'],
    array(
        'id',
        'kode',
        'tanggal',
        'start_date',
        'end_date',
        'description',
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
        'bom',
        'bom_kode',
        'item',
        'qty',
        'shift_rate',
        'shift_total',
        'kontrak_kode',
        'running_hours',
        'inforder',
        'order_tipe',
        'man_power',
        'verified',
        'verified_by',
        'verified_date',
        'approved',
        'approved_by',
        'approved_date',
        'finish',
        'finish_date',
        'create_by',
        'create_date',
        'update_by',
        'update_date',
        'status'
    ),
    "
        WHERE id = $id
    "
);
$R_JO = $DB->Row($Q_JO);
if($R_JO > 0){
    $JO = $DB->Result($Q_JO);

    $return['jo'] = $JO;

    /**
     * Extract Detail
     */
    $Q_Detail = $DB->QueryPort("
        SELECT
            D.item AS id,
            D.ref_qty AS qty_bom,
            D.qty AS qty_jo,
            TRIM(I.nama) AS nama,
            I.satuan,
            D.tipe,
            I.kode,
            I.in_decimal
        FROM
            item AS I,
            " . $Table['detail'] . " AS D
        WHERE
            D.header = $id AND
            D.tipe = 1 AND
            D.item = I.id
        ORDER BY
            tipe ASC
    ");
    $R_Detail = $DB->Row($Q_Detail);
    if($R_Detail > 0){

        $im = 0;
        while($Detail = $DB->Result($Q_Detail)){

            $return['jo']['material'][$im] = $Detail;

            /**
             * Get Stock
             */
            // $GetStock = App::GetStockItem(array(
            //     'company'   => $JO['company'],
            //     'storeloc'  => $JO['storeloc'],
            //     'item'      => $Detail['id']
            // ));
            // $return['jo']['material'][$im]['stock'] = $GetStock['stock'];
            // $return['jo']['material'][$im]['price'] = $GetStock['price'];
            //=> / END : Get Stock

            $im++;
        
        }

    }
}
//=> / END : GET JO

echo Core::ReturnData($return);
?>