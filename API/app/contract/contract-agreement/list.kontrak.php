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
    'def'       => 'kontrak_request',
    'detail'    => 'kontrak_request_detail'
);

$CLAUSE = "
    WHERE 
        company = '" . $company . "' AND
        approved = 1 AND
        id NOT IN (SELECT req FROM kontrak_agreement WHERE company = '" . $company . "')
";

if($keyword != '' && isset($keyword)){
    $CLAUSE .= " 
        AND kode LIKE '%" . $keyword . "%'
    ";
}

if($tanggal != '' && isset($tanggal)){
    $CLAUSE .= " 
        AND tanggal <= '" . $tanggal . "'
    ";
}

/**
 * Kontrak Request
 */
$Q_Data = $DB->Query(
    $Table['def'],
    array(
        'id',
        'kode',
        'start_date',
        'end_date'
    ),
    $CLAUSE
);
// $Q_Data = $DB->QueryPort("
//     SELECT 
//         id,
//         kode,
//         start_date,
//         end_date
//     FROM
//         kontrak_request
//     WHERE
//         company = '" . $company . "' AND
//         approved = 1 AND
//         id NOT IN (SELECT req FROM kontrak_agreement WHERE company = '" . $company . "')
// ");
$R_Data = $DB->Row($Q_Data);

if($R_Data > 0) {

    $i = 0;
    while($Data = $DB->Result($Q_Data)) {
        $return['kontrak'][$i] = $Data;

        /**
         * Get Detail
         */
        $Q_Detail = $DB->Query(
            $Table['detail'],
            array(
                'coa',
                'coa_kode',
                'coa_nama',
                'volume',
                'uom',
                'est_rate'      => 'rate',
                'total'         => 'amount',
                'keterangan'    => 'remarks'
            ),
            "
                WHERE
                    header = '" . $Data['id'] . "'
            "
        );
        $R_Detail = $DB->Row($Q_Detail);

        if($R_Detail > 0) {

            while($Detail = $DB->Result($Q_Detail)) {

                $return['kontrak'][$i]['list'][] = $Detail;
            }
        }
        //=> END : Get Detail

        $i++;
    }
}
//=> END : Kontrak Request

echo Core::ReturnData($return);
?>