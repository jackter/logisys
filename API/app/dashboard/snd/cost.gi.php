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
        $return['bulan'][$i] = $Month['tgl'];

        /**
         * Data SUM GI
         */
        $GI = $DB->Result($DB->QueryPort("
            SELECT
                SUM((D.qty_gi - D.qty_return) * D.price) AS total
            FROM
                " . $Table['def'] . " AS H,
                " . $Table['detail'] . " AS D
            WHERE
                D.header = H.id AND 
                H.tanggal LIKE '" . $Month['tgl'] . "-%'
        "));
        $return['val'][$i] = (real)$GI['total'];
        //=> / END : Data SUM GI

        /**
         * Grouping Dept
         */
        $Q_Dept = $DB->QueryPort("
            SELECT
                dept_abbr
            FROM
                " . $Table['def'] . "
            WHERE
                tanggal LIKE '" . $Month['tgl'] . "-%'
            GROUP BY
                dept_abbr
        ");
        while($Dept = $DB->Result($Q_Dept)){
            $return['dept'][$i][] = $Dept['dept_abbr'];
        }
        //=> / END : Grouping Dept

        $i++;
    }
}
//=> / END : Get Month

echo Core::ReturnData($return);
?>