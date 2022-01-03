<?php
$Modid = 96;

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
    'def'       => 'rgr',
    'detail'    => 'rgr_detail'
);


$CLAUSE = "";

$CLAUSE .= "
    AND H.tanggal BETWEEN '" . $fdari . "' AND '" . $fhingga . "'
";

if(!empty($company)){
    $CLAUSE .= "
        AND H.company = $company
    ";
}
if(!empty($storeloc)){
    $CLAUSE .= "
        AND D.storeloc = $storeloc
    ";
}

$Check = $DB->Row($DB->QueryPort("
    SELECT
        H.id
    FROM
        " . $Table['def'] . " AS H,
        " . $Table['detail'] . " AS D
    WHERE
        H.id != ''
        $CLAUSE
"));

if($Check > 0){
    
    $Q_Data = $DB->QueryPort("
    SELECT
        H.tanggal,
        H.kode,
        H.gr_kode,
        H.supplier_kode,
        H.supplier_nama,
        H.remarks,
        H.create_date,
        H.create_by,

        D.storeloc_kode,
        D.storeloc_nama,
        D.qty_receipt,
        D.act_qty_receipt,
        D.qty_return,

        I.kode AS item_kode,
        TRIM(I.nama) AS nama,
        I.satuan
    FROM
        " . $Table['def'] . " AS H,
        " . $Table['detail'] . " AS D,
        item AS I
    WHERE
        H.id = D.header AND
        D.item = I.id
        $CLAUSE
    ORDER BY 
        H.company,
        H.tanggal DESC,
        H.kode
    ");
    $R_Data = $DB->Row($Q_Data);

    if($R_Data > 0){
        $no = 1;
        $i = 0;
        while($Data = $DB->Result($Q_Data)){

            $return['data'][$i] = $Data;
            $return['data'][$i]['no'] = $no;

            $return['data'][$i]['create_by'] = Core::GetUser("nama", $Data['create_by']);

            $no++;
            $i++;
        }

    }
}

echo Core::ReturnData($return);
?>