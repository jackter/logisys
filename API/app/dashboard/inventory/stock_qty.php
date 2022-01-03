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

$Q_Data = $DB->QueryPort("
    SELECT
        G.nama,
        I.satuan,
        I.in_decimal, 
        SUM(S.stock) AS total 
    FROM
        storeloc_stock S,
        item I,
        item_grup G 
    WHERE
        I.id = S.item 
        AND I.grup = G.id 
    GROUP BY
        G.id
");
$R_Data = $DB->Row($Q_Data);

if($R_Data > 0){

    while($Data = $DB->Result($Q_Data)){

        $return['stock_qty'][] = array(
            'name'      => $Data['nama'],
            'decimal'   => $Data['in_decimal'],
            'y'         => $Data['total'],
            'satuan'    => $Data['satuan']
        );
    }
}

echo Core::ReturnData($return);

?>