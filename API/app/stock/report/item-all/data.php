<?php
$Modid = 34;

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
    'def'     => 'storeloc_stock_ledger'
);

/**
 * For Balance
 */
// if(isset($fdari)){
//     $ExF_Start_send = explode("-", $fdari);
//     $TAHUN_START = $ExF_Start_send[0];
//     $BULAN_START = ltrim($ExF_Start_send[1], 0);
// }
// if(isset($fhingga)){
//     $ExF_End_send = explode("-", $fhingga);
//     $TAHUN_END = $ExF_End_send[0];
//     $BULAN_END = ltrim($ExF_End_send[1], 0);
// }
//=> / END : For Balance

$CLAUSE = $CLAUSE2 = "";

// $CLAUSE .= "
//     AND tanggal BETWEEN '" . $TAHUN_START . "-" . $BULAN_START . "-01' and '" . $TAHUN_END . "-" . $BULAN_END . "-01' AND
// ";

if(!empty($company)){
    $CLAUSE .= "
        AND company = $company
    ";
    $CLAUSE2 .= "
        AND H.company = $company
    ";
}
if(!empty($storeloc)){
    $CLAUSE .= "
        AND storeloc = $storeloc
    ";
    $CLAUSE2 .= "
        AND H.storeloc = $storeloc
    ";
}

$Check = $DB->Row($DB->Query(
    $Table['def'],
    array(
        'id'
    ),
    "
        WHERE
            id != ''
            $CLAUSE
    "
));

if($Check > 0){
    
    $Q_Data = $DB->QueryPort("
        SELECT
            H.item,
            H.item_kode,
            H.item_nama,
            H.opening,
            H.closing,
            I.satuan
        FROM
           ". $Table['def'] ." AS H,
           item AS I
        WHERE
            H.item = I.id
            $CLAUSE2
    ");

    $R_Data = $DB->Row($Q_Data);
    if($R_Data > 0){
        $no = 1;
        $i = 0;
        while($Data = $DB->Result($Q_Data)){

            $return['data'][$i] = $Data;
            $return['data'][$i]['no'] = $no;

            $i++;
            $no++;
        }
    }

}

echo Core::ReturnData($return);
?>