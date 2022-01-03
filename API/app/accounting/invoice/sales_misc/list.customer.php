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
    'def'           => 'customer'
);

$CLAUSE = "";
if($keyword != '' && isset($keyword)){
    $CLAUSE .= " 
        AND (nama LIKE '%" . $keyword . "%' OR abbr LIKE '%" . $keyword . "%')
    ";
}

/**
 * Get Data
 */
$Q_Customer = $DB->Query(
    $Table['def'],
    array(
        'id'    => 'cust',
        'kode'  => 'cust_kode',
        'nama'  => 'cust_nama',
        'abbr'  => 'cust_abbr',
    ),
    "
        WHERE
            status = 1
            $CLAUSE
        GROUP BY
            id
        ORDER BY
            nama ASC
    "
);
$R_Customer = $DB->Row($Q_Customer);
if($R_Customer > 0){

    $i = 0;
    while($Customer = $DB->Result($Q_Customer)){

        $return[$i] = $Customer;

        $i++;
    }
}
//=> / END : Get Data

echo Core::ReturnData($return);
?>