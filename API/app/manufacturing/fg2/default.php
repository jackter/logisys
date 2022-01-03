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
    'def'         => 'storeloc',
    'stock'       => 'storeloc_stock'
);

/**
 * Load Data
 */
$Q_Data = $DB->Query(
    $Table['def'],
    array(
        'id'      => 'storeloc',
        'kode'    => 'storeloc_kode',
        'nama'    => 'storeloc_nama',
        'company',
        'company_abbr',
        'company_nama'
    ),
    "
        WHERE
            company = '".DEF['company']."' AND
            id IN (65,66)
    "
);
$R_Data = $DB->Row($Q_Data);
if($R_Data > 0){
    $i = 0;
    while($Data = $DB->Result($Q_Data)){

        $return['storeloc'][$i] = $Data;

        /**
         * Get Item Storeloc
         */
        $Q_Detail = $DB->QueryPort("
            SELECT
                D.item AS id,
                D.stock,
                D.stock AS stock_def,
                D.price,
                TRIM(I.nama) AS nama,
                I.satuan,
                I.kode,
                I.in_decimal
            FROM
                item AS I,
                " . $Table['stock'] . " AS D
            WHERE
                D.storeloc = '" . $Data['storeloc'] . "' AND
                D.item = I.id AND
                D.stock > 0 AND 
                I.grup = 8
            ORDER BY
                nama
        ");
        $R_Detail = $DB->Row($Q_Detail);
        if($R_Data > 0 ){

            $j = 0;
            while($Detail = $DB->Result($Q_Detail)){

                $return['storeloc'][$i]['item'][$j] = $Detail;

                $j++;
            }
        }
        //=> End Get Item Storeloc
    
        $i++;
    }

}
//=> Load Data

echo Core::ReturnData($return);
?>