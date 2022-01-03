<?php

$Modid = 69;
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
    'def'      => 'shipping'
);

//=> Clean Data
if (empty($limit)) {
    $limit = 10;
}
if (empty($offset)) {
    $offset = 0;
}

/**
 * Filter
 */
$CLAUSE = "
    WHERE 
        id != '' AND
        so = '" . $id . "'
";
$PermCompany = Core::GetState('company');
if ($PermCompany != "X") {
    $CLAUSE .= " AND company IN (" . $PermCompany . ")";
}

$PermDept = Core::GetState('dept');
if ($PermDept != "X" && !empty($PermDept)) {
    $CLAUSE .= " AND dept IN (" . $PermDept . ")";
}

$PermUsers = Core::GetState('users');
if ($PermUsers != "X") {
    if (!empty($PermUsers)) {
        $CLAUSE .= " AND create_by IN (" . $PermUsers . ")";
    } else {
        $CLAUSE .= " AND create_by = '" . Core::GetState('id') . "'";
    }
}
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
                                    $CLAUSE .= "verified = 0 AND approved = 0";
                                } else {
                                    $CLAUSE .= "OR verified = 0 AND approved = 0";
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

/**
 * Listing Data
 */
$return['start'] = 0;
$return['limit'] = $limit;
$return['count'] = 0;

$Q_Data = $DB->Query(
    $Table['def'],
    array('id'),
    $CLAUSE
);
$R_Data = $DB->Row($Q_Data);

if ($R_Data > 0) {

    $return['start'] = $start;
    $return['limit'] = $limit;
    $return['count'] = $R_Data;

    $Q_Data = $DB->Query(
        $Table['def'],
        array(
            'id',
            'tanggal',
            'kode',
            'qty_delivery',
            'so',
            'so_kode',
            'verified',
            'approved'
        ),
        $CLAUSE .
            "
            ORDER BY
                tanggal ASC
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
//=> / END : Listing Data

echo Core::ReturnData($return);

?>