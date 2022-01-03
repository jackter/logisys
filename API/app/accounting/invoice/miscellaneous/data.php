<?php

$Modid = 202;
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

$Table = array(
    'def'       => 'invoice'
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
        tipe = 4
";

$PermCompany = Core::GetState('company');
if ($PermCompany != "X") {
    $CLAUSE .= " AND company IN (" . $PermCompany . ")";
}

$PermUsers = Core::GetState('users');
if ($PermUsers != "X") {
    if (!empty($PermUsers)) {
        $CLAUSE .= " AND create_by IN (" . $PermUsers . ")";
    } else {
        $CLAUSE .= " AND create_by = '" . Core::GetState('id') . "'";
    }
}
//=> END : Filter

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
                            case "DRAFT":
                                if ($i == 0) {
                                    $CLAUSE .= "verified != 1 ";
                                } else {
                                    $CLAUSE .= "OR verified != 1 ";
                                }
                                break;
                            case "VERIFIED":
                                if ($i == 0) {
                                    $CLAUSE .= "verified = 1 ";
                                } else {
                                    $CLAUSE .= "OR verified = 1 ";
                                }
                                break;
                        }

                        if ($i == count($Val['values']) - 1) {
                            $CLAUSE .= ")";
                        }
                    }
                }
                break;
            case "verified":

                if (!empty($Val['values'])) {
                    $SEPARATOR = "";
                    $CLAUSE .= "AND (";
                    foreach ($Val['values'] as $Item) {

                        if (strtolower($Item) == "verified") {
                            $CLAUSE .= "
                                $SEPARATOR verified = 1 AND approved = 0
                            ";
                        }

                        if (strtolower($Item) == "unverified") {
                            $CLAUSE .= "
                                $SEPARATOR verified = 0
                            ";
                        }

                        if (strtolower($Item) == "approved") {
                            $CLAUSE .= "
                                $SEPARATOR approved = 1
                            ";
                        }
                        $SEPARATOR = "OR";
                    }
                    $CLAUSE .= ")";
                } else {
                    $CLAUSE .= "
                        AND 
                            verified = 2
                    ";
                }

                break;

            case ($Key == "ref_tgl" or $Key == "pajak_tgl"):  // Sesuaikan dengan field pada Table Col
                $Val = preg_replace('/[^0-9]/', '', $Val['filter']);

                $CLAUSE .= "
                                AND date_format($Key, '%d%m%Y') LIKE '%" . $Val . "%'
                            ";

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
            'company_abbr',
            'dept_abbr',
            'kode',
            'pihak_ketiga',
            'pihak_ketiga_kode',
            'pihak_ketiga_nama',
            'tipe',
            'ref_kode',
            'ref_tgl',
            'pajak_no',
            'pajak_tgl',
            'amount',
            'verified',
            'currency',
            'history'
        ),
        $CLAUSE .
            "
            ORDER BY
                create_date DESC
            LIMIT 
                $offset, $limit
        "
    );

    $i = 0;
    while ($Data = $DB->Result($Q_Data)) {

        $return['data'][$i] = $Data;

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