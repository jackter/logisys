<?php

$Modid = 191;
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
    'def'       => 'prd_tf_return'
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
        id != '' AND
        is_receive = 1
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
                                    $CLAUSE .= "OR verified = 1 AND approved = 0";
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
            'kode',
            'deliver_kode',
            'tanggal',
            'create_date',
            'verified',
            'approved',
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

        $return['data'][$i]['tanggal'] = date('d/m/Y', strtotime($Data['tanggal']));

        $return['data'][$i]['create_date'] = date('d/m/Y', strtotime($Data['create_date']));

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

        $i++;
    }
}

echo Core::ReturnData($return);

?>