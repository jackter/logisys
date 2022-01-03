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

// $return['permissions'] = Perm::Extract($Modid);

$Table = array(
    'def'       => 'sr',
    'detail'    => 'sr_detail'
);

$CLAUSE = "
    WHERE
        jo = '".$id."' AND
        tanggal BETWEEN '" . $fdari . "' AND '" . $fhingga . "'
";

// $return['clause'] = $CLAUSE;

$Q_Data = $DB->Query(
    $Table['def'],
    array('id'),
    $CLAUSE
);
$R_Data = $DB->Row($Q_Data);

if($R_Data > 0){

    /**
     * Get All id
     */
    $AllSR = [];
    while($SR = $DB->Result($Q_Data)){
        $AllSR[] .= $SR['id'];
    }
    //=> End Get All id

    $Q_Data2 = $DB->Query(
        $Table['def'],
        array(
            'id',
            'kode',
            'tanggal',
        ),
        "
            WHERE
                id IN (".implode(",", $AllSR).")
            ORDER BY
                create_date DESC
        "
    );

    $i = 0;
    while($Data = $DB->Result($Q_Data2)){

        $return['data'][$i] = $Data;

        /**
         * Extract Detail
         */
        $Q_Detail = $DB->QueryPort("
        SELECT
            D.item AS id,
            D.jo_qty,
            D.qty,
            TRIM(I.nama) AS nama,
            I.satuan,
            I.kode
        FROM
            item AS I,
            " . $Table['detail'] . " AS D
        WHERE
            D.header = '" . $Data['id'] . "' AND
            D.item = I.id
        ORDER BY
            I.nama ASC
        ");
        $R_Detail = $DB->Row($Q_Detail);
        if($R_Detail > 0){
            $j=0;
            while($Detail = $DB->Result($Q_Detail)){

                $return['data'][$i]['detail'][$j] = $Detail;

                $j++;
            }
        }
        //=> End Extract Detail
        $i++;
    }

}

echo Core::ReturnData($return);
?>