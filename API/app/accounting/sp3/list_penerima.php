<?php

#Default Statement
$return = [];
$RPL = "";
$SENT = Core::Extract($_POST, $RPL);

#Extract Array
if (isset($SENT)) {
    foreach ($SENT as $KEY => $VAL) {
        $$KEY = $VAL;
    }
}

$CLAUSE = "";
if ($keyword != '' && isset($keyword)) {
    $CLAUSE .= "
        AND nama LIKE '%" . $keyword . "%'
    ";
}

#Get Penerima
$Q_Data = $DB->QueryOn(
    DB['recon'],
    "pengirim_penerima",
    array(
        'id',
        'nama'
    ),
    "
        WHERE 
            id != '' 
            $CLAUSE 
        ORDER BY 
            nama ASC 
        LIMIT 20
    "
);
$R_Data = $DB->Row($Q_Data);
if ($R_Data > 0) {
    $i = 0;
    while ($Data = $DB->Result($Q_Data)) {
        $return[$i] = $Data;
        $i++;
    }
}

echo Core::ReturnData($return);

?>