<?php
$Modid = 110;

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
    'def'     => 'sp3'
);

// $fdari = stddate($fdari, "/");
// $fhingga = stddate($fhingga, "/");

$CLAUSE = $CLAUSE2 = "";

$CLAUSE .= "
    AND tanggal BETWEEN '" . $fdari . "' AND '" . $fhingga . "'
";

if(!empty($company)){
    $CLAUSE .= "
        AND company = $company
    ";
    $CLAUSE2 .= "
        AND S.company = $company
    ";
}
if(!empty($storeloc)){
    $CLAUSE .= "
        AND storeloc = $storeloc
    ";
    $CLAUSE2 .= "
        AND S.storeloc = $storeloc
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
            company_abbr,
            dept_abbr,
            kode,
            tanggal,
            po_no,
            po_tgl,
            penerima_nama,
            currency,
            total,
            keterangan_bayar,
            dept_nama,
            cost_center_nama,
            is_manual,
            verified,
            approved 
        FROM
            sp3
        WHERE
            id != ''
            $CLAUSE
        ORDER BY tanggal
    ");
    $R_Data = $DB->Row($Q_Data);

    if($R_Data > 0){
        $no = 1;
        $i = 0;
        while($Data = $DB->Result($Q_Data)){

            $return['data'][$i] = $Data;
            $return['data'][$i]['no'] = $no;

            $no++;
            $i++;
        }

    }
}

echo Core::ReturnData($return);
?>