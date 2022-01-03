<?php

$Modid = 138;
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
    'def'           => 'wo',
    'mr'            => 'mr',
    'mr_detail'     => 'mr_detail',
    'wo_mechanic'   => 'wo_mechanic',
    'wo_overtime'   => 'wo_overtime',
    'wo_material'   => 'wo_material',
    'wo_pro'        => 'wo_proses',
    'wo_pro_det'    => 'wo_proses_detail',

);

# Get Data
$Q_Data = $DB->Query(
    $Table['def'],
    array(
        'id',
        'kode',
        'req_kode',
        'company',
        'company_abbr',
        'company_nama',
        'dept',
        'dept_abbr',
        'dept_nama',
        'dept_section_abbr',
        'dept_section_nama',
        'lokasi',
        'lokasi_nama',
        'shift',
        'order_date',
        'section',
        'equipment',
        'equipment_kode',
        'maintenance_type',
        'running_hours',
        'job_title',
        'job_explan',
        'comment',
        'approved',
        'approved_by',
        'approved_date',
        'verified',
        'verified_by',
        'verified_date',
        'processed',
        'gm_approve',
        'gm_approved',
        'gm_approved_by',
        'gm_approved_date',
        'approved2',
        'approved2_by',
        'approved2_date',
        'accepted',
        'accepted_by',
        'accepted_date',
        'completed',
        'completed_by',
        'completed_date',
        'create_by',
        'create_date'
    ),
    "
        WHERE 
            id = '" . $id . "'
    "
);
$R_Data = $DB->Row($Q_Data);

if ($R_Data > 0) {
    $Data = $DB->Result($Q_Data);

    $return['data'] = $Data;

    $return['data']['maintenancet_type'] = (int) $Data['maintenancet_type'];

    $return['data']['create_by'] = Core::GetUser("nama", $Data['create_by']);
    $return['data']['create_date'] = date("d/m/Y H:i:s", strtotime($Data['create_date'])) . " WIB";

    if (!empty($Data['gm_approved_by'])) {
        $return['data']['gm_approved_by'] = Core::GetUser("nama", $Data['gm_approved_by']);
        $return['data']['gm_approved_date'] = date("d/m/Y H:i:s", strtotime($Data['gm_approved_date'])) . " WIB";
    }

    if (!empty($Data['approved_by'])) {
        $return['data']['approved_by'] = Core::GetUser("nama", $Data['approved_by']);
        $return['data']['approved_date'] = date("d/m/Y H:i:s", strtotime($Data['approved_date'])) . " WIB";
    }

    if (!empty($Data['verified_by'])) {
        $return['data']['verified_by'] = Core::GetUser("nama", $Data['verified_by']);
        $return['data']['verified_date'] = date("d/m/Y H:i:s", strtotime($Data['verified_date'])) . " WIB";
    }

    if (!empty($Data['completed_by'])) {
        $return['data']['completed_by'] = Core::GetUser("nama", $Data['completed_by']);
        $return['data']['completed_date'] = date("d/m/Y H:i:s", strtotime($Data['completed_date'])) . " WIB";
    }

    if (!empty($Data['approved2_by'])) {
        $return['data']['approved2_by'] = Core::GetUser("nama", $Data['approved2_by']);
        $return['data']['approved2_date'] = date("d/m/Y H:i:s", strtotime($Data['approved2_date'])) . " WIB";
    }

    if (!empty($Data['accepted_by'])) {
        $return['data']['accepted_by'] = Core::GetUser("nama", $Data['accepted_by']);
        $return['data']['accepted_date'] = date("d/m/Y H:i:s", strtotime($Data['accepted_date'])) . " WIB";
    }
    //=> BUSINESS UNIT TITLE 
    $Business = $DB->Result($DB->QueryOn(
        DB['master'],
        "company",
        array(
            'business_unit'
        ),
        "
            WHERE
                id = '" . $Data['company'] . "'
        "
    ));
    $return['data']['business_unit'] = $Business['business_unit'];

    /**
     * Get Detail MR
     */
    $Q_MR = $DB->QueryPort("
        SELECT
            D.id as mr_detail,
            D.item as item,
            I.kode as item_kode,
            I.nama as item_nama,
            D.qty,
            I.satuan,
            I.in_decimal,
            D.remarks as keterangan
        FROM
            mr H,
            mr_detail D,
            item I
        WHERE 
            H.ref_type = 2 AND
            H.ref IN (" . $id . ") AND
            H.id = D.header AND
            H.approved = 1 AND
            D.item = I.id
    ");
    $R_MR = $DB->Row($Q_MR);
     
    if($R_MR > 0) {
        $i = 0;
        while($MR = $DB->Result($Q_MR)) {

            $return['data']['material'][$i] = $MR;
            $i++;
        }
    }

    /**
     * Get Explain
     */
    $Q_Explain = $DB->Query(
        $Table['wo_pro'],
        array(
            'job_explain'
        ),
        "
            WHERE
                wo = '" . $id . "'
        "
    );
    $R_Explain = $DB->Row($Q_Explain);

    if($R_Explain > 0) {
        $i = 0;
        while($Explain = $DB->Result($Q_Explain)) {

            $return['data']['explain'][$i] = $Explain;
            $i++;
        }
    }
    //=> END : Get Explain

    /**
     * Get Mechanic
     */
    $Q_Mechanic = $DB->Query(
        $Table['wo_pro_det'],
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
                wo_header = '" . $id . "'
        "
    );
    $R_Mechanic = $DB->Row($Q_Mechanic);

    if($R_Mechanic > 0) {
        $i = 0;
        while($Mechanic = $DB->Result($Q_Mechanic)) {

            $return['data']['mechanic'][$i] = $Mechanic;
            $i++;
        }
    }
    //=> END : Get Mechanic

    /**
     * Get wo_overtime
     */
    $Q_Overtime = $DB->Query(
        $Table['wo_overtime'],
        array(
            'id',
            'kid',
            'nik',
            'nama',
            'level',
            'start_time',
            'end_time',
            'over_time',
            'over_date',
            'level',
            'remarks'
        ),
        "
            WHERE
                wo_header = '" . $id . "'
        "
    );
    $R_Overtime = $DB->Row($Q_Overtime);

    if($R_Overtime > 0) {
        $i = 0;
        while($Overtime = $DB->Result($Q_Overtime)) {

            $return['data']['overtime'][$i] = $Overtime;
            $i++;
        }

    }
    //=> END : Get wo_overtime

    /**
     * Get Aditional
     */
    $Q_Aditional = $DB->Query(
        $Table['wo_material'],
        array(
            'id',
            'header',
            'aditional',
            'item_nama',
            'qty',
            'satuan',
            'keterangan'
        ),
        "
            WHERE
                header = '" . $id . "' AND aditional = 1
        "
    );
    $R_Aditional = $DB->Row($Q_Aditional);

    if($R_Aditional > 0) {
        $i = 0;
        while($Aditional = $DB->Result($Q_Aditional)) {

            $return['data']['aditional'][$i] = $Aditional;
            $i++;
        }
        if (!$is_detail) {
            $return['data']['aditional'][$i] = array(
                'i' => 0
            );
        }
    }
    //=> END : Get Aditional

}
echo Core::ReturnData($return);

?>