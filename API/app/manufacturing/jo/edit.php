<?php

$Modid = 60;
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

$Table = array(
    'def'       => 'jo',
    'detail'    => 'jo_detail'
);

/**
 * Field
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
    'table'         => $Table['def'],
    'clause'        => "WHERE id = '" . $id . "'",
    'action'        => "update",
    'description'   => "Edit BOM (" . $kode . ")"
);
$History = Core::History($HistoryField);
$Field = array(
    'item'          => $output[0]['id'],
    'qty'           => $output[0]['qty'],
    'shift_rate'    => $shift_rate,
    'running_hours' => $running_hours,
    'man_power'     => $man_power,
    'kode'          => $kode,
    'kontrak_kode'  => $kontrak_kode,
    'inforder'      => $inforder,
    'order_tipe'    => $order_tipe,
    'tanggal'       => $jo_date_send,
    'start_date'    => $start_date_send,
    'end_date'      => $end_date_send,
    'description'   => $description,
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
                        'ref_qty'   => $material[$i]['ref_qty'],
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
                        'ref_qty'   => $output[$i]['ref_qty'],
                        'qty'       => $output[$i]['qty'],
                        'persentase'       => $output[$i]['persentase']
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
                        'ref_qty'   => $utility[$i]['ref_qty'],
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

        }
        //=> / END : Remove All Previous Detail

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