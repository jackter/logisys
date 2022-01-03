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

$MaxMonth = 6;

$Table = array(
    'def'       => 'gi',
    'detail'    => 'gi_detail'
);

$dept = json_decode($dept, true);

/**
 * Get Month
 */
$Q_Month = $DB->Query(
    $Table['def'],
    array(
        'SUBSTRING(tanggal, 1, 7)' => 'tgl'
    ),
    "
        GROUP BY SUBSTRING(tanggal, 1, 7)
        ORDER BY tanggal DESC
        LIMIT $MaxMonth
    "
);
$R_Month = $DB->Row($Q_Month);
if($R_Month > 0){

    $i = 0;
    while($Month = $DB->Result($Q_Month)){
        
        foreach ($dept as $key => $value) {
            /**
             * Data SUM GI Dept
             */
            $GI = $DB->Result($DB->QueryPort("
                SELECT
                    SUM((D.qty_gi - D.qty_return) * D.price) AS total
                FROM
                    " . $Table['def'] . " AS H,
                    " . $Table['detail'] . " AS D
                WHERE
                    D.header = H.id AND 
                    H.tanggal LIKE '" . $Month['tgl'] . "-%' AND 
                    H.dept_abbr = '" . $value . "'
            "));
            // $return['val'][$i]['dept']['nama'][] = $value;
            // $return['val'][$i]['dept']['data'][] = (real)$GI['total'];
            $return['dept'][$value][$i][] = (real)$GI['total'];
            //=> / END : Data SUM GI Dept
        }

        $i++;

    }

}
//=> / END : Get Month

echo Core::ReturnData($return);
?>