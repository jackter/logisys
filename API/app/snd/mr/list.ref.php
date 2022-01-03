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
    'def'           => $table
);

$CLAUSE = "";

if($company != '' && isset($company)){
    $CLAUSE .= "
        AND company = '" . $company . "'
    ";
}

if($table == 'wo' || $table == 'jo') {
    $Q_Ref = $DB->Query(
        $Table['def'],
        array(
            'id',
            'kode',
            'dept',
            'dept_abbr',
            'dept_nama'
        ),
        "
            WHERE
                verified = 1
                $CLAUSE
        "
    );
    $R_Ref = $DB->Row($Q_Ref);
    
    if($R_Ref > 0){
        $i = 0;
        while($Ref = $DB->Result($Q_Ref)){
            $return['ref'][$i] = $Ref;
    
            /**
             * Get Detail 
             */
            if($table == 'wo') {
    
                $Q_Detail = $DB->Query(
                    "wo_material",
                    array(
                        'item'          => 'id',
                        'item_kode'     => 'kode',
                        'item_nama'     => 'nama',
                        'qty',
                        'satuan'
                    ),
                    "
                        WHERE
                            header = '" . $Ref['id'] . "'
                    "
                );
                $R_Detail = $DB->Row($Q_Detail);
        
                if($R_Detail > 0) {
        
                    $j = 0;
                    while($Detail = $DB->Result($Q_Detail)) {
                        $return['ref'][$i]['list'][$j] = $Detail;
                        $j++;
                    }
                    $return['ref'][$i]['list'][$j] = array(
                        'i' => 0
                    );
                }
            }
    
            if($table == 'jo') {
                $Q_Detail = $DB->QueryPort("
                    SELECT
                        I.id,
                        I.kode,
                        I.nama,
                        I.grup,
                        I.item_type,
                        I.grup_nama,
                        I.satuan,
                        I.in_decimal,
                        D.qty
                    FROM
                        jo_detail D,
                        item I
                    WHERE
                        D.header = '" . $Ref['id'] . "' AND
                        D.item = I.id
                ");
                $R_Detail = $DB->Row($Q_Detail);
    
                if($R_Detail > 0) {
    
                    $j = 0;
                    while($Detail = $DB->Result($Q_Detail)) {
    
                        $return['ref'][$i]['list'][$j] = $Detail;
                        $j++;
                    }
                    $return['ref'][$i]['list'][$j] = array(
                        'i' => 0
                    );
                }
            }
            //=> END : Get Detail
    
            $i++;
        }
    }
}

if($table == 'ast') {
    $Q_Ref = $DB->Query(
        $Table['def'],
        array(
            'id',
            'kode'
        ),
        "
            WHERE
                verified = 1 AND 
                asset_usage = 1 AND 
                cip_post_asset = 0
                $CLAUSE
        "
    );
    $R_Ref = $DB->Row($Q_Ref);

    if($R_Ref > 0) {
        while($Ref = $DB->Result($Q_Ref)) {
            $return['ref'][] = $Ref;
        }
    }
}

echo Core::ReturnData($return);
?>