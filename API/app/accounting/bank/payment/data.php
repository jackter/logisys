<?php

$Modid = 117;

#Default Statement
$return = [];
$RPL = "";
$SENT = Core::Extract($_POST, $RPL);

#Extract array
if (isset($SENT)) {
    foreach ($SENT as $KEY => $VAL) {
        $$KEY = $VAL;
    }
}

$return['permissions'] = Perm::Extract($Modid);

$Table = array(
    'def' => 'bp'
);

$CLAUSE = "
    WHERE
        id != ''
";

$PermCompany = Core::GetState('company');
if ($PermCompany == "X") {
    $CLAUSE .= "";
} else {
    $CLAUSE .= " AND company IN (" . $PermCompany . ")";
}

#Clean Data
if (empty($limit)) {
    $limit = 10;
}
if (empty($offset)) {
    $offset = 0;
}

#Filter Table
$ftable = json_decode($ftable, true);
if (isset($ftable)) {
    foreach ($ftable as $Key => $Val) {
        #Generate Clause
        switch ($Key) {
            case ($Key == "tanggal"):  // Sesuaikan dengan field pada Table Col
                $Val = preg_replace('/[^0-9]/', '', $Val['filter']);

                $CLAUSE .= "
                    AND date_format($Key, '%d%m%Y') LIKE '%" . $Val . "%'
                ";

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
            'kode',
            'bank_kode',
            'no_rekening',
            'penerima_nama_bank',
            'reff_type',
            'currency',
            'kode',
            'subjek_nama',
            'total',
            'approved',
            'company_nama',
            'company_abbr',
            'tanggal'
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

        $i++;
    }
}
echo Core::ReturnData($return);

?>