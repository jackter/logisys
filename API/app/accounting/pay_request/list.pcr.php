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
    'def'       => 'rekap_pcr'
);

$CLAUSE = "";

if($keyword != '' && isset($keyword)){
    $CLAUSE .= " 
        AND kode LIKE '%" . $keyword . "%'
    ";
}

if($company != '' && isset($company)){
    $CLAUSE .= "
        AND company = '" . $company . "'
    ";
}

/**
 * Get Data
 */
$Q_PCR = $DB->QueryPort("
    SELECT
        id,
        kode,
        tanggal,
        company,
        company_abbr,
        company_nama,
        grand_total AS amount
    FROM
        " . $Table['def'] . "
    WHERE approved = 1
        AND IFNULL(sp3, 0) = 0
        $CLAUSE
    ORDER BY
        create_date desc
");
$R_PCR = $DB->Row($Q_PCR);
if($R_PCR > 0){

    $i = 0;
    while($PCR = $DB->Result($Q_PCR)){

        $return[$i] = $PCR;

        $i++;
    }
}
//=> / END : Get Data

echo Core::ReturnData($return);
?>