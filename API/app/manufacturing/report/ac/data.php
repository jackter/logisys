<?php
$Modid = 119;

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
    'def'       => 'jo',
    'detail'    => 'jo_detail',
    'sr'        => 'sr',
    'sr_detail' => 'sr_detail'
);

$CLAUSE = "
    WHERE
        id != '' AND 
        approved = 1 AND
        tanggal BETWEEN '" . $fdari . "' AND '" . $fhingga . "'
";

if(!empty($bom)){
    $CLAUSE .= "
        AND bom = '" . $bom . "' 
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
            'id'        => 'jo',
            'kode'      => 'jo_kode',
            'tanggal',
            'company',
            'company_abbr',
            'company_nama',
            'storeloc',
            'storeloc_kode',
            'storeloc_nama',
            'plant',
            'bom',
            'bom_kode'
        ),
        $CLAUSE .
        "
            ORDER BY
                create_date DESC
        "
    );

    $i = 0;
    while($Data = $DB->Result($Q_Data)){

        $return['data'][$i] = $Data;

        /**
         * Extract Detail
         */
        $Q_Detail = $DB->QueryPort("
        SELECT
            D.item AS id,
            D.qty,
            TRIM(I.nama) AS nama,
            I.satuan,
            I.kode
        FROM
            item AS I,
            " . $Table['detail'] . " AS D
        WHERE
            D.header = '" . $Data['jo'] . "' AND
            D.item = I.id
        ORDER BY
            I.nama ASC
        ");
        $R_Detail = $DB->Row($Q_Detail);
        if($R_Detail > 0){
            $j=0;
            while($Detail = $DB->Result($Q_Detail)){

                $return['data'][$i]['detail'][$j] = $Detail;

                /**
                 * Get SR
                 */
                $Q_SR = $DB->Query(
                    $Table['sr'],
                    array('id'),
                    "
                        WHERE
                            jo = '".$Data['jo']."'
                    "
                );
                $R_SR = $DB->Row($Q_SR);
                if($R_SR > 0){
                    $AllSR = [];
                    while($SR = $DB->Result($Q_SR)){
                        $AllSR[] = $SR['id'];
                    }

                    $Q_SR_detail = $DB->Query(
                        $Table['sr_detail'],
                        array(
                            "SUM(qty)" => "total"
                        ),
                        "
                            WHERE
                                header IN (" . implode(",", $AllSR) .") AND
                                item = '". $Detail['id'] ."' 
                        "
                    );
                    $R_SR_detail = $DB->Row($Q_SR_detail);

                    $total = 0;
                    if($R_SR_detail > 0){
                        $SR_Total = $DB->Result($Q_SR_detail);
                        
                        $return['data'][$i]['detail'][$j]['total'] = (int)$SR_Total['total'];

                    }
                }
                //=> End Get SR

                $j++;
            }
        }
        //=> End Extract Detail
        $i++;
    }

}

echo Core::ReturnData($return);
?>