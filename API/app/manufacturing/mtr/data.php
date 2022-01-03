<?php

$Modid = 64;
Perm::Check($Modid, 'view');

//=> Default Statement
$return = [];
$RPL    = "";
$SENT    = Core::Extract($_POST, $RPL);

//=> Extract Array
if (isset($SENT)) {
    foreach ($SENT as $KEY => $VAL) {
        $$KEY = $VAL;
    }
}

$return['permissions'] = Perm::Extract($Modid);

$Table = array(
    'def'       => 'prd_tf'
);

//=> Clean Data
if (empty($limit)) {
    $limit = 10;
}
if (empty($offset)) {
    $offset = 0;
}

$return['start']        = 0;
$return['limit']        = $limit;
$return['count']        = 0;

/**
 * Filter
 */
$CLAUSE = "
    WHERE 
        id != ''
";
//=> / END : Filter

/**
 * Filter Table
 */
$ftable = json_decode($ftable, true);
if (isset($ftable)) {
    foreach ($ftable as $Key => $Val) {

        /**
         * Generate Clause
         */
        switch ($Key) {
            case "status_data":
                if (count($Val['values']) > 0) {
                    for ($i = 0; $i < count($Val['values']); $i++) {
                        if ($i == 0) {
                            $CLAUSE .= "AND ( ";
                        }

                        switch ($Val['values'][$i]) {
                            case "UNVERIFIED":
                                if ($i == 0) {
                                    $CLAUSE .= "verified = 0";
                                } else {
                                    $CLAUSE .= "OR verified = 0";
                                }
                                break;
                            case "VERIFIED":
                                if ($i == 0) {
                                    $CLAUSE .= "verified = 1 AND approved = 0";
                                } else {
                                    $CLAUSE .= "OR verified = 1  AND approved = 0";
                                }
                                break;
                            case "APPROVED":
                                if ($i == 0) {
                                    $CLAUSE .= "verified = 1 AND approved = 1";
                                } else {
                                    $CLAUSE .= "OR verified = 1 AND approved = 1";
                                }
                                break;
                        }

                        if ($i == count($Val['values']) - 1) {
                            $CLAUSE .= ")";
                        }
                    }
                }

                break;
            default:
                $CLAUSE .= "
                    AND 
                        $Key LIKE '%" . $Val['filter'] . "%'                    
                ";
        }
        //=> / END : Generate Clause
    }
}
//=> / END : Filter Table

$Q_Data = $DB->Query(
    $Table['def'],
    array('id'),
    $CLAUSE
);
$R_Data = $DB->Row($Q_Data);

if ($R_Data > 0) {

    $return['start']        = $start;
    $return['limit']        = $limit;
    $return['count']        = $R_Data;

    $Q_Data = $DB->Query(
        $Table['def'],
        array(
            'id',
            'jo_kode',
            'kode',
            'remarks',
            'verified',
            'approved',
            'create_date',
            'history'
        ),
        $CLAUSE .
            "
            ORDER BY
                id DESC
            LIMIT 
                $offset, $limit
        "
    );

    $i = 0;
    while ($Data = $DB->Result($Q_Data)) {

        $return['data'][$i] = $Data;

        /**
         * Last Hostory
         */
        $History = json_decode($Data['history'], true);
        $History = $History[0];
        $FormatHistory = $History['description'] . " - " . datetime_db_en($History['time']);

        $User = Core::GetUser("nama", $History['user']);
        if (!empty($User)) {
            $FormatHistory .= " - By " . $User;
        }

        $return['data'][$i]['history'] = $FormatHistory;
        // => End Last History

        /**
         * Calculate Progress
         */
        // $Q_Progress = $DB->QueryPort("
        //     SELECT
        //         D.header,
        //         sum(D.qty_ref) total,
        //         sum(D.qty_receive) total_receive
        //     FROM
        //         prd_tf_deliver T,
        //         prd_tf_deliver_detail D 
        //     WHERE
        //         T.prd = '" . $Data['id'] . "' AND
        //         T.id = D.header
        //     GROUP BY
        //         header
        // ");

        // $Progress = $DB->Result($Q_Progress);

        // if($Progress['total']){
        //     $return['data'][$i]['total_qty'] = (int)$Progress['total'];
        // }else{
        //     $return['data'][$i]['total_qty'] = 0;
        // }

        // if($Progress['total_receive']){
        //     $return['data'][$i]['total_receive'] = (int)$Progress['total_receive']; 
        // }else{
        //     $return['data'][$i]['total_receive'] = 0;
        // }

        //=> END : Calculate Progress

        /**
         * Get Total Request
         */
        $TotalReq = $DB->Result($DB->Query(
            $Table['def'] . "_detail",
            array(
                "SUM(qty)" => "total"
            ),
            "
                WHERE
                    header = '" . $Data['id'] . "'
            "
        ));
        $return['data'][$i]['total_qty'] = $TotalReq['total'];
        //=> / END : Get Total Request

        /**
         * Get Total Received
         */
        $Q_Deliver = $DB->Query(
            $Table['def'] . '_deliver',
            array(
                'id'
            ),
            "
                WHERE 
                    prd = '" . $Data['id'] . "' AND 
                    approved_rcv = 1
            "
        );
        $R_Deliver = $DB->Row($Q_Deliver);
        if ($R_Deliver > 0) {
            $IDsDeliver = "";
            $IDsDeliverComma = "";
            while ($Deliver = $DB->Result($Q_Deliver)) {
                $IDsDeliver .= $IDsDeliverComma . $Deliver['id'];
                $IDsDeliverComma = ",";
            }

            $TotalRec = $DB->Result($DB->Query(
                $Table['def'] . "_deliver_detail",
                array(
                    "SUM(qty_receive)" => "total"
                ),
                "
                    WHERE
                        header IN (" . $IDsDeliver . ")
                "
            ));
            $TotalRec = $TotalRec['total'];
        } else {
            $TotalRec = 0;
        }
        $return['data'][$i]['total_receive'] = $TotalRec;
        //=> / END : Get Total Received

        $i++;
    }
}

echo Core::ReturnData($return);

?>