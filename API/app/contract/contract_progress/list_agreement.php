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
    'def'     => 'kontrak_agreement',
    'detail'  => 'kontrak_agreement_detail'
);

/**
 * Filter
 */
$CLAUSE = "
    WHERE 
        id != '' AND
        company = '".$company."' AND
        kontraktor = '".$kontraktor."' AND
        approved = 1
";

if($keyword != '' && isset($keyword)){
    $CLAUSE .= " 
        AND kode LIKE '%" . $keyword . "%'
    ";
}

if($tanggal != '' && isset($tanggal)){
    $CLAUSE .= " 
        AND '" . $tanggal . "' BETWEEN start_date AND end_date
    ";
}

/**
 * Extract Data
 */
$Q_Data = $DB->Query(
    $Table['def'],
    array('id'),
    $CLAUSE
);
$R_Data = $DB->Row($Q_Data);
if ($R_Data > 0) {

    $Q_Data = $DB->Query(
        $Table['def'],
        array(
            'id',
            'kode',
            'start_date',
            'end_date',
            'ppn',
            'pph',
            'currency'
        ),
        $CLAUSE .
        "
            LIMIT 50
        "
    );

    $i = 0;
    while ($Data = $DB->Result($Q_Data)) {

        $return[$i] = $Data;

        /**
         * Get Detail
         */
        $Q_Detail = $DB->Query(
            $Table['detail'],
            array(
                'id',
                'coa',
                'coa_kode',
                'coa_nama',
                'volume',
                'uom',
                'rate',
                'remarks',
                'current_progress'
            ),
            "
                WHERE
                    header = '" . $Data['id'] . "'
            "
        );
        $R_Detail = $DB->Row($Q_Detail);

        if($R_Detail > 0) {

            while($Detail = $DB->Result($Q_Detail)) {

                $return[$i]['list'][] = $Detail;
            }
        }
        //=> END : Get Detail

        $i++;
    }

}


echo Core::ReturnData($return);
?>