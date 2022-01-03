<?php

$Modid = 112;
Perm::Check($Modid, 'view');

# Default Statement
$return = [];
$RPL = "";
$SENT = Core::Extract($_POST, $RPL);

# Extract Array 
if (isset($SENT)) {
    foreach ($SENT as $KEY => $VAL) {
        $$KEY = $VAL;
    }
}

$return['permissions'] = Perm::Extract($Modid);

$Table = array(
    'def' => 'oip'
);

# Clean Data 
if (empty($limit)) {
    $limit = 10;
}
if (empty($offset)) {
    $offset = 0;
}

# Filter
$CLAUSE = "
    WHERE 
        id != ''
";

# Filter Table 
$ftable = json_decode($ftable, true);
if (isset($ftable)) {
    foreach ($ftable as $Key => $Val) {
        # Generate Clause 
        switch ($Key) {
            case "status_data":
                if (count($Val['values']) > 0) {
                    for ($i = 0; $i < count($Val['values']); $i++) {
                        if ($i == 0) {
                            $CLAUSE .= "AND ( ";
                        }

                        switch ($Val['values'][$i]) {
                            case "DRAFT":
                                if ($i == 0) {
                                    $CLAUSE .= "verified = 0";
                                } else {
                                    $CLAUSE .= "OR verified = 0";
                                }
                                break;
                            case "VERIFIED":
                                if ($i == 0) {
                                    $CLAUSE .= "verified = 1";
                                } else {
                                    $CLAUSE .= "OR verified = 1";
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
                    AND $Key LIKE '%" . $Val['filter'] . "%'
            ";
        }
    }
}

# Listing Data 
$return['start'] = 0;
$return['limit'] = $limit;
$return['count'] = 0;

$Q_Data = $DB->Query(
    $Table['def'],
    array('id' . $QSql),
    $CLAUSE . $QSqlClause
);

$R_Data = $DB->Row($Q_Data);

if ($R_Data > 0) {
    $return['start'] = $start;
    $return['limit'] = $limit;
    $return['count'] = $R_Data;

    $ORDER = "ORDER by id DESC";
    if (!empty($QSql)) {
        $ORDER = "ORDER BY relevance DESC";
    }

    $Q_Data = $DB->Query(
        $Table['def'],
        array(
            'id',
            'kode',
            'tanggal',
            'plant',
            'verified' . $QSql
        ),
        $CLAUSE .
            $QSqlClause .
            $ORDER .
            " 
            LIMIT  $offset, $limit
        "
    );

    $i = 0;
    while ($Data = $DB->Result($Q_Data)) {
        $return['data'][$i] = $Data;
        $i++;
    }
}

echo Core::ReturnData($return);

?>