<?php

$Modid = 13;
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

//=> Clean Data
if (empty($limit)) {
    $limit = 10;
}
if (empty($offset)) {
    $offset = 0;
}

$Table = array(
    'def'       => 'sys_user'
);

//==================== FILTER ====================
$CLAUSE = "
    WHERE 
        id != '' AND 
        id != 1
";
// $QSql = $QSqlClause = "";
// if (isset($fkeywords)) {
//     $Search = Search::Create(
//         $fkeywords,
//         array(
//             'username',
//             'nama'
//         ),
//         array(
//             2,
//             1
//         )
//     );

//     $QSql = "," . $Search['query'];
//     $QSqlClause = $Search['having'];
// }

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
                            case "DISABLED":
                                if ($i == 0) {
                                    $CLAUSE .= "status = 0";
                                } else {
                                    $CLAUSE .= "OR status = 0";
                                }
                                break;
                            case "ACTIVE":
                                if ($i == 0) {
                                    $CLAUSE .= "status = 1";
                                } else {
                                    $CLAUSE .= "OR status = 1";
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
    while ($Data = $DB->Result($Q_Data)) {

        $return['start']    = $start;
        $return['limit']    = $limit;
        $return['count']    = $R_Data;

        $Q_Data = $DB->Query(
            $Table['def'],
            array(
                'id',
                'username',
                'nama',
                'gperm',
                'status'
            ),
            $CLAUSE .
            "
                ORDER BY
                    status DESC,
                    nama ASC
                LIMIT 
                    $offset, $limit
            "
        );

        $i = 0;
        while ($Data = $DB->Result($Q_Data)) {
            $return['data'][$i] = $Data;
            $i++;
        }
    }
}
//=> / END : Extract Data

echo Core::ReturnData($return);

?>