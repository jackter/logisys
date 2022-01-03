<?php

$Modid = 61;
Perm::Check($Modid, 'add');

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

$material = json_decode($material, true);
$output = json_decode($output, true);
$utility = json_decode($utility, true);
$list_man_power = json_decode($list_man_power, true);
$list = json_decode($list, true);

$Table = array(
    'def'       => 'actual_production',
    'detail'    => 'actual_production_detail',
    'man_power' => 'actual_production_man_power'
);

/**
 * Define Department
 */
if ($plant == 1) {
    $dept       = DEF['dept']['refinery']['id'];
    $dept_abbr  = DEF['dept']['refinery']['abbr'];
    $dept_nama  = DEF['dept']['refinery']['nama'];
} elseif ($plant == 2) {
    $dept       = DEF['dept']['fractionation']['id'];
    $dept_abbr  = DEF['dept']['fractionation']['abbr'];
    $dept_nama  = DEF['dept']['fractionation']['nama'];
}
//=> / END : Define Department


/**
 * Create Code
 */
$Time = date('y') . "/" . romawi(date('n')) . "/";
$InitialCode = "PRD/" . strtoupper(DEF['company_abbr']) . "-" . strtoupper($dept_abbr) . "/" . $Time;
$Len = 4;
$LastKode = $DB->Result($DB->Query(
    $Table['def'],
    array('kode'),
    "
        WHERE
            kode LIKE '" . $InitialCode . "%' 
        ORDER BY 
            REPLACE(kode, '" . $InitialCode . "', '') DESC
    "
));
$LastKode = (int)substr($LastKode['kode'], -$Len) + 1;
$LastKode = str_pad($LastKode, $Len, 0, STR_PAD_LEFT);

$kode = $InitialCode . $LastKode;
//=> / END : Create Code

/**
 * Field
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
    'table'         => $Table['def'],
    'clause'        => "WHERE kode = '" . $kode . "'",
    'action'        => "add",
    'description'   => "Create AP (" . $kode . ")"
);
$History = Core::History($HistoryField);
$Field = array(
    'kode'          => $kode,
    'tanggal'       => $ap_date_send,
    'shift'         => $shift,
    'jo'            => $jo,
    'jo_kode'       => $jo_kode,
    'man_power'     => $man_power,
    'running_hours' => $running_hours,
    'create_by'     => Core::GetState('id'),
    'create_date'   => $Date,
    'history'       => $History
);
//=> / END : Field
$DB->ManualCommit();

/**
 * Insert Data
 */
if ($DB->Insert(
    $Table['def'],
    $Field
)) {

    /**
     * Insert Detail
     */
    $Q_Header = $DB->Query(
        $Table['def'],
        array('id'),
        "
            WHERE
                kode = '" . $kode . "' AND
                create_date = '" . $Date . "'
        "
    );
    $R_Header = $DB->Row($Q_Header);
    if ($R_Header > 0) {
        $Header = $DB->Result($Q_Header);

        /**
         * Material
         */
        for ($i = 0; $i < sizeof($material); $i++) {
            if (!empty($material[$i]['qty'])) {

                $FieldDetail = array(
                    'header'    => $Header['id'],
                    'tipe'      => 1,
                    'item'      => $material[$i]['id'],
                    'jo_qty'    => $material[$i]['qty_jo'],
                    'qty'       => $material[$i]['qty']
                );

                $return['material'][$i] = $FieldDetail;

                if ($DB->Insert(
                    $Table['detail'],
                    $FieldDetail
                )) {
                    $return['status_material'][$i] = array(
                        'index'     => $i,
                        'status'    => 1,
                    );
                } else {
                    $return['status_material'][$i] = array(
                        'index'     => $i,
                        'status'    => 0,
                        'error_msg' => $GLOBALS['mysql']->error
                    );
                }
            }
        }
        //=> / END : Material

        /**
         * Output
         */
        for ($i = 0; $i < sizeof($output); $i++) {
            if (!empty($output[$i]['qty'])) {

                $FieldDetail = array(
                    'header'        => $Header['id'],
                    'tipe'          => 2,
                    'item'          => $output[$i]['id'],
                    'jo_qty'        => $output[$i]['qty_jo'],
                    'qty'           => $output[$i]['qty'],
                    'persentase'    => $output[$i]['persentase'],
                );

                $return['output'][$i] = $FieldDetail;

                if ($DB->Insert(
                    $Table['detail'],
                    $FieldDetail
                )) {
                    $return['status_output'][$i] = array(
                        'index'     => $i,
                        'status'    => 1,
                    );
                } else {
                    $return['status_output'][$i] = array(
                        'index'     => $i,
                        'status'    => 0,
                        'error_msg' => $GLOBALS['mysql']->error
                    );
                }
            }
        }
        //=> / END : Output

        /**
         * Utility
         */
        for ($i = 0; $i < sizeof($utility); $i++) {
            if (!empty($utility[$i]['qty'])) {

                $FieldDetail = array(
                    'header'    => $Header['id'],
                    'tipe'      => 3,
                    'item'      => $utility[$i]['id'],
                    'jo_qty'    => $utility[$i]['qty_jo'],
                    'qty'       => $utility[$i]['qty']
                );

                $return['utility'][$i] = $FieldDetail;

                if ($DB->Insert(
                    $Table['detail'],
                    $FieldDetail
                )) {
                    $return['status_utility'][$i] = array(
                        'index'     => $i,
                        'status'    => 1,
                    );
                } else {
                    $return['status_utility'][$i] = array(
                        'index'     => $i,
                        'status'    => 0,
                        'error_msg' => $GLOBALS['mysql']->error
                    );
                }
            }
        }
        //=> / END : Utility

        /**
         * Downtime
         */
        // for($i = 0; $i < sizeof($downtime); $i++){
        //     if(!empty($downtime[$i]['id'])){

        //         $FieldDetail = array(
        //             'header'     => $Header['id'],
        //             'dt_id'      => $downtime[$i]['id'],
        //             'dt_kode'    => $downtime[$i]['kode'],
        //             'dt_nama'    => $downtime[$i]['nama'],
        //             'dt_durasi'  => $downtime[$i]['duration']
        //         );

        //         $return['downtime'][$i] = $FieldDetail;

        //         if($DB->Insert(
        //             $Table['DTime'],
        //             $FieldDetail
        //         )){
        //             $return['status_downtime'][$i]= array(
        //                 'index'     => $i,
        //                 'status'    => 1,
        //             );
        //         }else{
        //             $return['status_downtime'][$i] = array(
        //                 'index'     => $i,
        //                 'status'    => 0,
        //                 'error_msg' => $GLOBALS['mysql']->error
        //             );
        //         }

        //     }
        // }
        // => End Downtime

        /**
         * Consumtion
         */
        for ($i = 0; $i < sizeof($list); $i++) {
            if (!empty($list[$i]['id'])) {

                $FieldDetail = array(
                    'header'    => $Header['id'],
                    'tipe'      => 4,
                    'item'      => $list[$i]['id'],
                    'qty'       => $list[$i]['qty']
                );

                $return['list'][$i] = $FieldDetail;

                if ($DB->Insert(
                    $Table['detail'],
                    $FieldDetail
                )) {
                    $return['status_list'][$i] = array(
                        'index'     => $i,
                        'status'    => 1,
                    );
                } else {
                    $return['status_list'][$i] = array(
                        'index'     => $i,
                        'status'    => 0,
                        'error_msg' => $GLOBALS['mysql']->error
                    );
                }
            }
        }
        // => End Consumtion

        /**
         * Man Power
         */
        for ($i = 0; $i < sizeof($list_man_power); $i++) {
            if (!empty($list_man_power[$i]['nama'])) {

                $FieldDetail = array(
                    'header'    => $Header['id'],
                    'kid'       => $list_man_power[$i]['kid'],
                    'nik'       => $list_man_power[$i]['nik'],
                    'nama'      => $list_man_power[$i]['nama']
                );

                $return['man_power'][$i] = $FieldDetail;

                if ($DB->Insert(
                    $Table['man_power'],
                    $FieldDetail
                )) {
                    $return['status_man_power'][$i] = array(
                        'index'     => $i,
                        'status'    => 1,
                    );
                } else {
                    $return['status_man_power'][$i] = array(
                        'index'     => $i,
                        'status'    => 0,
                        'error_msg' => $GLOBALS['mysql']->error
                    );
                }
            }
        }
        // => End Man Power

    }
    //=> / END : Insert Detail
    $DB->Commit();

    $return['status'] = 1;
} else {
    $return = array(
        'status'    => 0,
        'error_msg' => $GLOBALS['mysql']->error
    );
}

echo Core::ReturnData($return);

?>