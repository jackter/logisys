<?php

$Modid = 195;
Perm::Check($Modid, 'view');

//=> Default Statement
$return = [];
$RPL    = "";
$SENT   = Core::Extract($_POST, $RPL);

//=> Extract Array
if (isset($SENT)) {
    foreach ($SENT as $KEY => $VAL) {
        $$KEY = $VAL;
    }
}

$return['permissions'] = Perm::Extract($Modid);

$Table = array(
    'def'       => 'jo',
    'sr'        => 'sr',
    'item'      => 'item'
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
                                    $CLAUSE .= "verified = 1 AND approved = 0 AND finish = 0";
                                } else {
                                    $CLAUSE .= "OR verified = 1 AND approved = 0 finish = 0";
                                }
                                break;
                            case "APPROVED":
                                if ($i == 0) {
                                    $CLAUSE .= "verified = 1 AND approved = 1 AND finish = 0";
                                } else {
                                    $CLAUSE .= "OR verified = 1 AND approved = 1 AND finish = 0";
                                }
                                break;
                            case "FINISH":
                                if ($i == 0) {
                                    $CLAUSE .= "finish = 1";
                                } else {
                                    $CLAUSE .= "OR finish = 1";
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
            'storeloc_kode',
            'plant',
            'kode',
            'item',
            'qty',
            'start_date',
            'end_date',
            'description',
            'verified',
            'approved',
            'finish',
            'history'
        ),
        $CLAUSE .
            "
            AND approved = 1
            ORDER BY
                id DESC
            LIMIT 
                $offset, $limit
        "
    );

    $i = 0;
    while ($Data = $DB->Result($Q_Data)) {

        $return['data'][$i] = $Data;

        $Item = $DB->Result($DB->Query(
            $Table['item'],
            array(
                'kode',
                'nama2' => 'nama',
                'satuan'
            ),
            "
                WHERE
                    id = '" . $Data['item'] . "'
            "
        ));
        $return['data'][$i]['item_kode'] = $Item['kode'];
        $return['data'][$i]['nama'] = $Item['nama'];
        $return['data'][$i]['satuan'] = $Item['satuan'];

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