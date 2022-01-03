<?php
$Modid = 86;

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
    'def' => 'coa_master'
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
        status != 0
";

$PermCompany = Core::GetState('company');
if($PermCompany != "X"){
    $CLAUSE .= " AND company IN (" . $PermCompany . ")";
}

# Filter Table 
$ftable = json_decode($ftable, true);
if (isset($ftable)) {
    foreach ($ftable as $Key => $Val) {
        # Generate Clause 
        switch ($Key) {
            case "is_h":
                $CLAUSE .= "
                    AND (('Yes' LIKE '%" . $Val['filter'] . "%' AND is_h = 1) OR ('No' LIKE '%" . $Val['filter'] . "%' AND is_h = 0))
                ";
            break;

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
            'company',
            'company_abbr',
            'company_nama',
            'kode',
            'nama',
            'is_h',
            'type',
            'lv1',
            'lv2',
            'lv3',
            'lv4',
            'lv5',
            'lv6'
        ),
        $CLAUSE .
        " 
            ORDER BY
                company,
                kode,
                nama ASC
            LIMIT  $offset, $limit
        "
    );

    $i = 0;
    while ($Data = $DB->Result($Q_Data)) {

        if($Data['is_h'] == 1){
            $Data['is_h'] = 'Yes';
        }
        else{
            $Data['is_h'] = 'No';
        }

        $return['data'][$i] = $Data;

        $i++;
    }
}

echo Core::ReturnData($return);
?>
