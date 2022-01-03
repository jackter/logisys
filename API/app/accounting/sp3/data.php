<?php

$Modid = 109;
Perm::Check($Modid, 'view');

#Default Statement
$return = [];
$RPL = "";
$SENT = Core::Extract($_POST, $RPL);

#Extract array
if (isset($SENT)) {
    foreach ($SENT as $KEY  => $VAL) {
        $$KEY = $VAL;
    }
}

$return['permissions'] = Perm::Extract($Modid);

$Table = array(
    'def' => 'sp3'
);

# Clean data
if (empty($limit)) {
    $limit = 10;
}
if (empty($offset)) {
    $offset = 0;
}

# Filter
$CLAUSE = "
    WHERE 
        id != '' AND
        is_manual = 1
";

$PermCompany = Core::GetState('company');
if ($PermCompany != "X") {
    $CLAUSE .= " AND company IN (" . $PermCompany . ")";
}

// $PermDept = Core::GetState('dept');
// if($PermDept != "X"){
//     $CLAUSE .= " AND dept IN (" . $PermDept . ")";
// }

$PermCost = Core::GetState('cost_center');
if($PermCost != "X" && !empty($PermCost)){
    $CLAUSE .= " AND (create_by = '" . Core::GetState('id') . "' OR cost_center IN (" . $PermCost . "))";
}

$PermUsers = Core::GetState('users');
if ($PermUsers != "X") {
    if (!empty($PermUsers)) {
        $CLAUSE .= " AND create_by IN (" . $PermUsers . ")";
    } else {
        $CLAUSE .= " AND create_by = '" . Core::GetState('id') . "'";
    }
}

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
                            case "Unverified":
                                if ($i == 0) {
                                    $CLAUSE .= "verified != 1 ";
                                } else {
                                    $CLAUSE .= "OR verified != 1 ";
                                }
                                break;
                            case "Verified, Waiting Approve":
                                if ($i == 0) {
                                    $CLAUSE .= "verified = 1 AND approved != 1 ";
                                } else {
                                    $CLAUSE .= "OR verified = 1 AND approved != 1 ";
                                }
                                break;
                            case "Payment on Process":
                                // if($i == 0){
                                //     $CLAUSE .="verified = 1 AND approved != 1 ";
                                // }else{
                                //     $CLAUSE .="OR verified = 1 AND approved != 1 ";
                                // }
                                break;
                            case "Approved":
                                if ($i == 0) {
                                    $CLAUSE .= "approved = 1 ";
                                } else {
                                    $CLAUSE .= "OR approved = 1 ";
                                }
                                break;
                            case "Canceled":
                                if ($i == 0) {
                                    $CLAUSE .= "status = 0 ";
                                } else {
                                    $CLAUSE .= "OR status = 0 ";
                                }
                                break;
                        }

                        if ($i == count($Val['values']) - 1) {
                            $CLAUSE .= ")";
                        }
                    }
                }
                break;
            case "company_abbr":

                $CLAUSE .= "
                    AND company_abbr LIKE '%" . $Val['filter'] . "%'
                ";
                break;

            default:
                $CLAUSE .= "
                AND $Key LIKE '%" . $Val['filter'] . "%'                    
            ";
        }
    }
}

# listing data
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
            'company',
            'company_nama',
            'company_abbr',
            'po_no',
            'po_tgl',
            'penerima_nama',
            'total',
            'currency',
            'keterangan_bayar',
            'verified',
            'approved',
            'status'
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


        //get Enabled Journal
        $Q_Company = $DB->Result($DB->QueryOn(
            DB['master'],
            "company",
            array(
                'journal'
            ),
            "
                WHERE 
                    id = '" . $Data['company'] . "'
            "
        ));
        $return['data'][$i]['enable_journal'] = $Q_Company['journal'];

        /**
         * Get Status
         */
        $Q_BPU_DETAIL = $DB->QueryOn(
            DB['recon'],
            "bpu_detail",
            array('header'),
            "WHERE kode = '" . $Data['kode'] . "'"
        );
        $R_BPU_DETAIL = $DB->Row($Q_BPU_DETAIL);
        if ($R_BPU_DETAIL > 0) {
            $BPU_DETAIL = $DB->Result($Q_BPU_DETAIL);

            $BPU = $DB->Result($DB->QueryOn(
                DB['recon'],
                "bpu",
                array(
                    'approved',
                    'kode',
                    'create_date' => 'bpu_tgl'
                ),
                "WHERE id = '" . $BPU_DETAIL['header'] . "'"
            ));

            $return['data'][$i]['bpu_kode'] = $BPU['kode'];
            $return['data'][$i]['bpu_tgl'] = "-";
            if ($BPU['bpu_tgl'] != '0000-00-00' && !empty($BPU['bpu_tgl'])) {
                $return['data'][$i]['bpu_tgl'] = date('d/m/Y', strtotime($BPU['bpu_tgl']));
            }
        }
        // END=> Get Status

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