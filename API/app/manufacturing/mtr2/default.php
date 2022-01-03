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
    'jo'          => 'jo',
    'detail'      => 'jo_detail'
);

$CLAUSE = "
    WHERE
        id != '' AND
        approved = 1 AND
        finish = 0
";

$return['permissions'] = Perm::Extract($Modid);

/**
 * Load JO
 */
$Q_Data = $DB->Query(
    $Table['jo'],
    array(
        'id',
        'kode'      => 'jo_kode',
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
        'shift_rate',
        'running_hours',
        'finish'
    ),
    $CLAUSE
);
$R_Data = $DB->Row($Q_Data);
if($R_Data > 0){
    $i = 0;
    while($Data = $DB->Result($Q_Data)){

        $return['JO'][$i] = $Data;
    
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
                D.header = '" . $Data['id'] . "' AND
                D.tipe = 1 AND
                D.item = I.id
            ORDER BY
                tipe ASC
        ");
        $R_Detail = $DB->Row($Q_Detail);
        if($R_Detail > 0){

            $im = 0;
            while($Detail = $DB->Result($Q_Detail)){
    
                $return['JO'][$i]['material'][$im] = $Detail;

                /**
                 * Get Stock
                 */
                $GetStock = App::GetStockItem(array(
                    'company'   => $Data['company'],
                    'storeloc'  => $storeloc,
                    'item'      => $Detail['id']
                ));
                $return['JO'][$i]['material'][$im]['stock'] = $GetStock['stock'];
                $return['JO'][$i]['material'][$im]['price'] = $GetStock['price'];
                //=> / END : Get Stock

                $im++;
            
            }
    
        }

        $i++;
    }

}
    //=> / END : Extract Detail

echo Core::ReturnData($return);
?>