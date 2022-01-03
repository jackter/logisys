<?php
$Modid = 184;
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
    'def'     => 'oil_move',
    'tank'    => 'storeloc',
    'sounding'  => 'sounding',
    'wb' => 'wb_transaksi'
);

$CLAUSE = "
    WHERE
        DATE_FORMAT(tanggal, '%Y-%m-%d') BETWEEN '" . $fdari . "' AND '" . $fhingga . "'
";

if(!empty($company)){
    $CLAUSE .= "
        AND company = $company
    ";
}

/**
 * Get Data Sounding
 */
$Q_Data = $DB->Query(
    $Table['def'],
    array(),
    $CLAUSE
);
$R_Data = $DB->Row($Q_Data);

if($R_Data > 0) {

    while($Data = $DB->Result($Q_Data)) {
        $return['data'][] = $Data;
    }
}
//=> END : Get Data Sounding

/**
 * Get Data Tank
 */
$Q_Tank = $DB->Query(
    $Table['tank'],
    array(
        'id',
        'kode',
        'nama',
        'produk'
    ),
    "
        WHERE
            company = '" . $company . "' AND
            sounding = 1
    "
);
$R_Tank = $DB->Row($Q_Tank);

if($R_Tank > 0) {
    while($Tank = $DB->Result($Q_Tank)) {
        $return['tank'][] = $Tank;
    }
}
//=> END : Get Data Tank

/**
 * Get Sounding
 */
// $Q_Sounding = $DB->Query(
//     $Table['sounding'],
//     array(

//     ),
//     "
//         WHERE
//             company = '" . $company . "'
//     "
// );
// $R_Sounding = $DB->Row($Q_Sounding);
// if($R_Sounding > 0){
//     while($Sounding = $DB->Result($Q_Sounding)){

//         /**
//          * Detail
//          */
//         $Q_Detail = $DB->Query(
//             $Table['sounding'] . "_detail",
//             array(),
//             "
//                 WHERE
//                     id = '" . $Sounding['id'] . "'
//             "
//         );
//         $R_Detail = $DB->Row($Q_Detail);

//         $Total = 0;
//         if($R_Detail > 0){
//             while($Detail = $DB->Result($Q_Detail)){



//             }
//         }
//         //=> / END : Detail
        
//     }
// }
//=> / END : Get Sounding

/**
 * RECEIVE - WB
 */
$CPO = 2021;

$Q_WB = $DB->Query(
    $Table['wb'],
    array(
        "SUM(netto)" => 'netto'
    ),
    "
        WHERE
            item = $CPO AND 
            DATE_FORMAT(create_date, '%Y-%m-%d') BETWEEN '" . $fdari . "' AND '" . $fhingga . "'
    "
);
$R_WB =  $DB->Row($Q_WB);
if($R_WB > 0){
    $WB = $DB->Result($Q_WB);

    $return['wb'] = $WB['netto'];
}
//=> / END : RECEIVE - WB

echo Core::ReturnData($return);
?>