<?php
$Modid = 84;

Perm::Check($Modid, 'view');

#Default Statement
$return = [];
$RPL    = "";
$SENT    = Core::Extract($_POST, $RPL);

#Extract Array
if (isset($SENT)) {
    foreach ($SENT as $KEY => $VAL) {
        $$KEY = $VAL;
    }
}

$return['permissions'] = Perm::Extract($Modid);

$Table = array(
    'def' => 'dept',
    'def2' => 'company'
);

#Clean Data
if (empty($limit)) {
    $limit = 10;
}
if (empty($offset)) {
    $offset = 0;
}

#Filter
$CLAUSE = "
    WHERE 
        id != ''
";

# Filter Table
$ftable = json_decode($ftable, true);
if (isset($ftable)) {
    foreach ($ftable as $Key => $Val) {
        #Generate Clause
        switch ($Key) {
            default:
                $CLAUSE .= "
                AND $Key LIKE '%" . $Val['filter'] . "%'                    
            ";
        }
    }
}

#Listing Data
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

    $ORDER = "ORDER BY company ASC";
    if (!empty($QSql)) {
        $ORDER = "ORDER BY relevance DESC";
    }

    $Q_Data = $DB->QueryOn(
        DB['master'],
        $Table['def'],
        array(
            'id',
            'company',
            'abbr',
            'nama' . $QSql
        ),
        $CLAUSE . $QSqlClause . $ORDER . "
            LIMIT $offset, $limit
        "
    );

    $i = 0;
    while ($Data = $DB->Result($Q_Data)) {

        $return['data'][$i] = $Data;

        $Q_Company = $DB->QueryOn(
            DB['master'],
            $Table['def2'],
            array(
                'id',
                'abbr'
            ),
            " 
                WHERE id = '" . $Data['company'] . "'
            "
        );
        $R_Company = $DB->Row($Q_Company);
        if ($R_Company > 0) {
            $Company = $DB->Result($Q_Company);
            $return['data'][$i]['company_abbr'] = $Company['abbr'];
        }
        $i++;
    }
}

echo Core::ReturnData($return);

?>
