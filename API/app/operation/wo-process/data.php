<?php

$Modid = 197;
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


$Table = array(
    'wo'        => 'wo',
    'def'       => 'wo_proses',
    'detail'    => 'wo_proses_detail'
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
        id != ''
";
//=> / END : Filter

/**
 * Filter Permissions
 */
$PermCompany = Core::GetState('company');
if ($PermCompany == "X") {
    $CLAUSE .= "";
} else {
    $CLAUSE .= " AND company IN (" . $PermCompany . ")";
}

$PermDept = Core::GetState('dept');
if ($PermDept != "X" && !empty($PermDept)) {
    $CLAUSE .= " AND dept IN (" . $PermDept . ")";
}
//=> END : FIlter Permissions

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
$return['start']        = 0;
$return['limit']        = $limit;
$return['count']        = 0;

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

        $WO = $DB->Result($DB->Query(
            $Table['wo'],
            array(
                'completed',
                'dept_section_nama',
                'lokasi_nama',
                'equipment_kode'
            ),
            "
                WHERE id = '".$Data['wo']."'
            "
        ));

        $return['data'][$i]['completed'] = $WO['completed'];
        $return['data'][$i]['dept_section_nama'] = $WO['dept_section_nama'];
        $return['data'][$i]['lokasi_nama'] = $WO['lokasi_nama'];
        $return['data'][$i]['equipment_kode'] = $WO['equipment_kode'];

        /**
         * Get Mechanic
         */
        $Q_Mechanic = $DB->Query(
            $Table['detail'],
            array(
                'id',
                'kid',
                'nik',
                'nama',
                'start_time',
                'end_time',
                'act_hours',
                'level'
            ),
            "
                WHERE
                    header = '" . $Data['id'] . "'
            "
        );
        $R_Mechanic = $DB->Row($Q_Mechanic);

        if($R_Mechanic > 0) {
            $j = 0;
            while($Mechanic = $DB->Result($Q_Mechanic)) {

                $return['data'][$i]['mechanic'][$j] = $Mechanic;
                $j++;
            }
        }
        //=> END : Get Mechanic

        /**
         * Last History
         */
        $History = json_decode($Data['history'], true);
        $History = $History[0];
        $FormatHistory = $History['description'] . " - " . datetime_db_en($History['time']);

        $User = Core::GetUser("nama", $History['user']);
        if (!empty($User)) {
            $FormatHistory .= " - By " . $User;
        }

        $return['data'][$i]['history'] = $FormatHistory;
        //=> / END : Last History

        $i++;
    }
}
//=> / END : Listing Data

echo Core::ReturnData($return);

?>