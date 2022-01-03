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
} elseif ($tipe == 4) {
    $pihak_ketiga = 'transporter';
} elseif ($tipe == 5) {
    $pihak_ketiga = 'general';
}

$CLAUSE = "";
if($keyword != '' && isset($keyword)){
    $CLAUSE .= " 
        AND pihak_ketiga_nama LIKE '%" . $keyword . "%'
    ";
}

$CLAUSE .= "
    AND company = '" . $company . "'
";

$Q_PihakKetiga = $DB->QueryPort("
    SELECT
        x.pihak_ketiga AS id,
        x.pihak_ketiga_kode AS kode,
        x.pihak_ketiga_nama AS nama,
        y.jenis 
    FROM
        invoice x,
        " . $pihak_ketiga . " y 
    WHERE
        x.pihak_ketiga = y.id 
        AND x.tipe = 4
        AND x.tipe_pihak_ketiga = " . $tipe . "
        AND verified = 1 
        AND sp3 = 0
        $CLAUSE 
    GROUP BY
        x.pihak_ketiga 
    ORDER BY
        x.pihak_ketiga_nama ASC 
");
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