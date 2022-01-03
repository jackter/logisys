<?php
$Modid = 36;

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
    'def'       => 'gi',
    'detail'    => 'gi_detail',
    'pr'        => 'pr',
    'prd'       => 'pr_detail',
    'po'        => 'po',
    'pod'       => 'po_detail',
    'storeloc'  => 'storeloc',
    'stock'     => 'storeloc_stock',
    'mr'        => 'mr',
    'mrd'       => 'mr_detail'
);

/**
 * Extract Detail
 */
$Q_Detail = $DB->QueryPort("
    SELECT
        D.id AS detail_id,
        D.item AS id,
        D.qty_mr,
        D.qty_gi,
        I.kode AS kode,
        TRIM(I.nama2) AS nama,
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
    $return['status'] = 1;
    while($Detail = $DB->Result($Q_Detail)){

        $return['data'][$i] = $Detail;

        $i++;
    }
}
//=> / END : Extract Detail

echo Core::ReturnData($return);
?>