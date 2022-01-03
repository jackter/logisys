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
    'wo'            => 'wo',
    'def'           => 'wo_proses',
    'detail'        => 'wo_proses_detail',
    'wo_mechanic'   => 'wo_mechanic',
    'wo_material'   => 'wo_material',
    'wo_overtime'   => 'wo_overtime'

);

# Get Data
$Q_Data = $DB->Query(
    $Table['def'],
    array(
        
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

   
    /**
     * Get Detail MR
     */
    // $Q_MR = $DB->QueryPort("
    //     SELECT
    //         D.id as mr_detail,
    //         D.item as item,
    //         I.kode as item_kode,
    //         I.nama as item_nama,
    //         D.qty,
    //         I.satuan,
    //         I.in_decimal,
    //         D.remarks as keterangan
    //     FROM
    //         mr H,
    //         mr_detail D,
    //         item I
    //     WHERE 
    //         H.ref_type = 2 AND
    //         H.ref IN (" . $id . ") AND
    //         H.id = D.header AND
    //         H.approved = 1 AND
    //         D.item = I.id
    // ");
    // $R_MR = $DB->Row($Q_MR);
     
    // if($R_MR > 0) {
    //     $i = 0;
    //     while($MR = $DB->Result($Q_MR)) {

    //         $return['data']['material'][$i] = $MR;
    //         $i++;
    //     }
    // }

    /**
     * Get Mechanic
     */
    $Q_Mechanic = $DB->Query(
        $Table['detail'],
        array(
            'id' => 'id_detail',
            'kid' => 'id',
            'nik',
            'nama',
            'start_time',
            'end_time',
            'act_hours',
            'level'
        ),
        "
            WHERE
                header = '" . $id . "'
        "
    );
    $R_Mechanic = $DB->Row($Q_Mechanic);

    if($R_Mechanic > 0) {
        $i = 0;
        while($Mechanic = $DB->Result($Q_Mechanic)) {

            $return['data']['mechanic'][$i] = $Mechanic;
            $i++;
        }
        if (!$is_detail) {
            $return['data']['mechanic'][$i] = array(
                'i' => 0
            );
        }
    }
    //=> END : Get Mechanic


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
                header_wo_proses = '" . $id . "' AND aditional = 1
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

    /**
     * Get wo_overtime
     */
    $Q_Overtime = $DB->Query(
        $Table['wo_overtime'],
        array(
            'id' => 'id_detail',
            'kid' => 'id',
            'nik',
            'nama',
            'level',
            'start_time'=> 'start_time_over',
            'end_time' => 'end_time_over',
            'over_time',
            'over_date',
            'level',
            'remarks'
        ),
        "
            WHERE
                header = '" . $id . "'
        "
    );
    $R_Overtime = $DB->Row($Q_Overtime);

    if($R_Overtime > 0) {
        $i = 0;
        while($Overtime = $DB->Result($Q_Overtime)) {

            $return['data']['overtime'][$i] = $Overtime;
            $i++;
        }
        if (!$is_detail) {
            $return['data']['overtime'][$i] = array(
                'i' => 0
            );
        }
    }
    //=> END : Get wo_overtime

    $WO = $DB->Result($DB->Query(
        $Table['wo'],
        array('completed'),
        "
            WHERE id = '".$Data['wo']."'
        "
    ));

    $return['data']['completed'] = $WO['completed'];

}
echo Core::ReturnData($return);

?>