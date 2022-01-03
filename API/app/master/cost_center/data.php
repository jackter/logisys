<?php

$Modid = 133;
Perm::Check($Modid, 'view');

# Default Statement
$return = [];
$RPL    = "";
$SENT    = Core::Extract($_POST, $RPL);

# Extract Array
if (isset($SENT)) {
    foreach ($SENT as $KEY => $VAL) {
        $$KEY = $VAL;
    }
}

$return['permissions'] = Perm::Extract($Modid);

$Table = array(
    'def' => 'cost_center'
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
        /*Generate Clause*/
        switch ($Key) {
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

    $return['start']        = $start;
    $return['limit']        = $limit;
    $return['count']        = $R_Data;

    $Q_Data = $DB->Query(
        $Table['def'],
        array(
            'id',
            'company',
            'company_abbr',
            'kode',
            'nama',
            'keterangan',
        ),
        $CLAUSE .
            "
            ORDER BY
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
} else { }

echo Core::ReturnData($return);

?>
