<?php
$Modid = 49;

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
    'def' => 'company'
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
            default: $CLAUSE .= " 
                    AND $Key LIKE '%" . $Val['filter'] . "%'
            ";
        }
    }
}

# Listing Data 
$return['start'] = 0;
$return['limit'] = $limit;
$return['count'] = 0;

$Q_Data = $DB->QueryOn(
    DB['master'],
    $Table['def'],
    array('id' . $QSql),
    $CLAUSE . $QSqlClause
);

$R_Data = $DB->Row($Q_Data);

if ($R_Data > 0) {
    $return['start'] = $start;
    $return['limit'] = $limit;
    $return['count'] = $R_Data;

    $ORDER = "ORDER by grup ASC";
    if (!empty($QSql)) {
        $ORDER = "ORDER BY relevance DESC";
    }

    $Q_Data = $DB->QueryOn(
        DB['master'],
        $Table['def'],
        array(
            'id',
            'abbr',
            'nama',
            'grup'. $QSql
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
