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

if ($tipe == 1) {
    $pihak_ketiga = 'supplier';
} elseif ($tipe == 2) {
    $pihak_ketiga = 'kontraktor';
} elseif ($tipe == 3) {
    $pihak_ketiga = 'customer';
} elseif ($tipe == 4) {
    $pihak_ketiga = 'transporter';
} elseif ($tipe == 5) {
    $pihak_ketiga = 'general';
}

$CLAUSE = "";

if($keyword != '' && isset($keyword)){
    $CLAUSE .= " 
        AND nama LIKE '%" . $keyword . "%'
    ";
}

$Q_PihakKetiga = $DB->Query(
    $pihak_ketiga,
    array(
        'id',
        'kode',
        'nama'
    ),
    "
        WHERE
            status = 1
            $CLAUSE
        ORDER BY
            nama ASC
        LIMIT 50
    "
);
$R_PihakKetiga = $DB->Row($Q_PihakKetiga);
if($R_PihakKetiga > 0){
    $i = 0;
    while($PihakKetiga = $DB->Result($Q_PihakKetiga)){
        $return[$i] = $PihakKetiga;
        $i++;
    }
}

echo Core::ReturnData($return);
?>