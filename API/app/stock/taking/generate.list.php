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
    'stock'     => 'storeloc_stock',
    'item'      => 'item'
);

/**
 * Get Data
 */
$Q_Data = $DB->QueryPort("
    SELECT
        I.id AS id,
        I.kode AS kode,
        TRIM(I.nama) AS nama,
        I.satuan,
        I.in_decimal
    FROM
        " . $Table['stock'] . " AS S,
        " . $Table['item'] . " AS I
    WHERE
        S.item = I.id AND 
        S.company = '" . $company . "' AND 
        S.storeloc = '" . $storeloc . "' AND 
        S.stock > 0
    ORDER BY
        I.kode ASC
");
$R_Data = $DB->Row($Q_Data);
if($R_Data > 0){
    $i = 0;
    while($Data = $DB->Result($Q_Data)){

        $return['data'][$i] = $Data;
        $return['data'][$i]['i'] = $i;

        $Stock = App::GetStockItem(array(
            'company'       => $company,
            'storeloc'      => $storeloc,
            'item'          => $Data['id']
        ));

        $return['data'][$i]['stock'] = $Stock['stock'];
        $return['data'][$i]['price'] = $Stock['price'];

        $i++;

    }
}
//=> / END : Get Data

echo Core::ReturnData($return);
?>