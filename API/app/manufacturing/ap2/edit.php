<?php

$Modid = 61;
Perm::Check($Modid, 'edit');

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
$downtime = json_decode($downtime, true);
$list = json_decode($list, true);

$Table = array(
    'def'       => 'actual_production',
    'detail'    => 'actual_production_detail',
    'DTime'     => 'actual_production_downtime'
);

/**
 * Field
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
    'table'         => $Table['def'],
    'clause'        => "WHERE id = '" . $id . "'",
    'action'        => "update",
    'description'   => "Edit AP (" . $kode . ")"
);
$History = Core::History($HistoryField);
$Field = array(
    'tanggal'       => $ap_date_send,
    'shift'         => $shift,
    'man_power'     => $man_power,
    'update_by'     => Core::GetState('id'),
    'update_date'   => $Date,
    'history'       => $History
);
//=> / END : Field
$DB->ManualCommit();

/**
 * Insert Data
 */
if ($DB->Update(
    $Table['def'],
    $Field,
    "id = '" . $id . "'"
)) {

    /**
     * Insert Detail
     */
    $Q_Header = $DB->Query(
        $Table['def'],
        array('id'),
        "
            WHERE
                id = '" . $id . "'
        "
    );
    $R_Header = $DB->Row($Q_Header);
    if ($R_Header > 0) {

        //=> Remove All Previous Detail
        if ($DB->Delete(
            $Table['detail'],
            "header = '" . $id . "'"
        )) {

            $Header = $DB->Result($Q_Header);

            /**
             * Material
             */
            for ($i = 0; $i < sizeof($material); $i++) {
                if (!empty($material[$i]['id'])) {

                    $FieldDetail = array(
                        'header'    => $Header['id'],
                        'tipe'      => 1,
                        'item'      => $material[$i]['id'],
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
                if (!empty($output[$i]['id'])) {

                    $FieldDetail = array(
                        'header'    => $Header['id'],
                        'tipe'      => 2,
                        'item'      => $output[$i]['id'],
                        'qty'       => $output[$i]['qty'],
                        'persentase'       => $output[$i]['persentase'],
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
                if (!empty($utility[$i]['id'])) {

                    $FieldDetail = array(
                        'header'    => $Header['id'],
                        'tipe'      => 3,
                        'item'      => $utility[$i]['id'],
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
        }
        //=> / END : Remove All Previous Detail

        /**
         * Remove Sr Downtime
         */
        if ($DB->Delete(
            $Table['DTime'],
            "header = '" . $id . "'"
        )) {

            /**
             * Downtime
             */
            for ($i = 0; $i < sizeof($downtime); $i++) {
                if (!empty($downtime[$i]['id'])) {

                    $FieldDetail = array(
                        'header'     => $Header['id'],
                        'dt_id'      => $downtime[$i]['id'],
                        'dt_kode'    => $downtime[$i]['kode'],
                        'dt_nama'    => $downtime[$i]['nama'],
                        'dt_durasi'  => $downtime[$i]['duration']
                    );

                    $return['downtime'][$i] = $FieldDetail;

                    if ($DB->Insert(
                        $Table['DTime'],
                        $FieldDetail
                    )) {
                        $return['status_downtime'][$i] = array(
                            'index'     => $i,
                            'status'    => 1,
                        );
                    } else {
                        $return['status_downtime'][$i] = array(
                            'index'     => $i,
                            'status'    => 0,
                            'error_msg' => $GLOBALS['mysql']->error
                        );
                    }
                }
            }
            // => End Downtime

        }
        // => End Remove SR Downtime
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