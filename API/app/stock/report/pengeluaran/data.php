<?php
$Modid = 95;

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
    'def'       => 'gi',
    'detail'    => 'gi_detail',
    'mr_d'      => 'mr_detail'
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
        H.mr,
        H.mr_kode,
        H.remarks,
        H.create_date,
        H.create_by,

        D.storeloc_kode,
        D.storeloc_nama,
        D.qty_mr,
        D.qty_gi,
        D.price,

        D.item,
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

            /**
             * Get Remarks from mr
             */
            $Q_MR = $DB->Query(
                $Table['mr_d'],
                array(
                    'remarks'
                ),
                "
                    WHERE
                        header = '" . $Data['mr'] . "' AND 
                        item = '" . $Data['item'] . "'
                "
            );
            $R_MR = $DB->Row($Q_MR);
            if($R_MR > 0){
                $MR = $DB->Result($Q_MR);

                $return['data'][$i]['mr_remarks'] = $MR['remarks'];
                
            }
            //=> / END : Get Remarks from mr

            $return['data'][$i]['create_by'] = Core::GetUser("nama", $Data['create_by']);

            $no++;
            $i++;
        }

    }
}

echo Core::ReturnData($return);
?>