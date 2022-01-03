<?php

$Modid = 123;
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
    'def' => 'sounding'
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
                        # code...
                        if ($i == 0) {
                            $CLAUSE .= "AND (";
                        }

                        switch ($Val['values'][$i]) {
                            case "DRAFT":
                                if ($i == 0) {
                                    $CLAUSE .= "approved = 0 ";
                                } else {
                                    $CLAUSE .= "approved = 0";
                                }
                                break;
                            case "APPROVED":
                                if ($i == 0) {
                                    $CLAUSE .= "approved = 1";
                                } else {
                                    $CLAUSE .= "approved = 1";
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
    }
}

# Listing Data 
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
            'company',
            'company_abbr',
            'company_nama',
            'approved',
            'remarks',
            'create_date'
        ),
        $CLAUSE .
            " 
            ORDER BY
                id DESC
            LIMIT  $offset, $limit
        "
    );

    $i = 0;
    $LastTanggal = "";
    while ($Data = $DB->Result($Q_Data)) {
        $return['data'][$i] = $Data;

        if (empty($LastTanggal)) {
            $LastTanggal = $Data['tanggal'];
        }
        $i++;
    }

    $return['last_tanggal'] = $LastTanggal;

    $CountUnapproved = $DB->Count(
        $Table['def'],
        "
            WHERE
                approved != 1 OR 
                approved IS NULL
        "
    );
    $return['unapproved'] = $CountUnapproved;
}

echo Core::ReturnData($return);

?>