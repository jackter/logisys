<?php 

/*Default Statement*/
$return = [];
$RPL = "";
$SENT = Core::Extract($_POST, $RPL);

/*Extract Array*/
if (isset($SENT)) {
    foreach ($SENT as $KEY => $VAL) {
        $$KEY = $VAL;
    }
}

$Table = array(
    'def' => 'coa_master'
);

/**
 * Filter
 */
$CLAUSE = "
    WHERE
        id != '' AND
        status = 1 AND
        is_h = 0 AND
        company = '" . $company . "'
";
if($keyword != '' && isset($keyword)){
    $CLAUSE .= " 
        AND (kode LIKE '%" . $keyword . "%'
        OR nama LIKE '%" . $keyword . "%')
    ";
}
//=> END : Filter

/** Get Data */
$Q_Data = $DB->Query(
    $Table['def'],
    array(
        'id',
        'kode',
        'nama' 
    ),
    $CLAUSE
);

$R_Data = $DB->Row($Q_Data);
if ($R_Data > 0) {
    $i = 0;
    while($Data = $DB->Result($Q_Data)){
        $return[$i] = $Data;

        $i++;
    }    
}

echo Core::ReturnData($return);
?>
