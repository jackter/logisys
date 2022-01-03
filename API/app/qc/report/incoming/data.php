<?php
$Modid = 122;

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

$return['permissions'] = Perm::Extract($Modid);

$Table = array(
    'def'       => 'wb_transaksi'
);

$Tdari = substr($Tdari, 0, 2) . ":" . substr($Tdari, -2);
$Thingga = substr($Thingga, 0, 2) . ":" . substr($Thingga, -2);

$CLAUSE = "
    WHERE
        id != '' AND 
        create_date BETWEEN '" . $fdari . " " . $Tdari . ":00' AND '" . $fhingga . " " . $Thingga . ":59'
";
// if(strtotime($fdari) == strtotime($fhingga)){
//     $CLAUSE = "
//         WHERE
//             id != '' AND 
//             create_date LIKE '" . $fdari . "%'
//     ";
// }

if($flisting_type != 0){
    $CLAUSE .= "
        AND 
            (
                (ffa_qc != 0 AND ffa_qc IS NOT NULL) OR 
                (mai_qc != 0 AND mai_qc IS NOT NULL) OR
                (dobi_qc != 0 AND dobi_qc IS NOT NULL) 
            )
    ";
}

if (!empty($pks)) {
    $CLAUSE .= "
        AND pks = '" . $pks . "'
    ";
}

// $return['clause'] = $CLAUSE;

$Q_Data = $DB->Query(
    $Table['def'],
    array('id'),
    $CLAUSE
);
$R_Data = $DB->Row($Q_Data);

if($R_Data > 0){
    $Q_Data = $DB->Query(
        $Table['def'],
        array(
            'create_date',
            'w_out_date',
            'item_nama',
            'veh_nopol',
            'netto',
            'pks',
            'ffa_qc',
            'mai_qc',
            'dobi_qc',
            'IF(ffa_qc != 0 AND ffa_qc IS NOT NULL, 1, 0)'  => 'has_ffa',
            'IF(mai_qc != 0 AND mai_qc IS NOT NULL, 1, 0)'  => 'has_mai',
            'IF(dobi_qc != 0 AND dobi_qc IS NOT NULL, 1, 0)'  => 'has_dobi'
        ),
        $CLAUSE .
        "
            AND pks != ''
            AND item = 2021
            ORDER BY
                pks ASC,
                create_date ASC,
                id ASC
        "
    );

    $i = 0;
    $no = 1;
    $DefinedSaldo = [];
    while($Data = $DB->Result($Q_Data)){

        $return['data'][$i] = $Data;
        $return['data'][$i]['no'] = $no;

        $i++;
        $no++;
    }
}


echo Core::ReturnData($return);
?>