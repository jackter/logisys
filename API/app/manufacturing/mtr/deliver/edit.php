<?php

$Modid = 64;

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

if ($is_reception == 1) {
    Perm::Check($Modid, 'edit');
} else {
    Perm::Check($Modid, 'edit_deliver');
}

if (isset($material)) {
    $material = json_decode($material, true);
} else {
    $material = array();
}

if (isset($list)) {
    $list = json_decode($list, true);
} else {
    $list = array();
}

$Table = array(
    'detail'    => 'prd_tf_detail',
    'deliver'   => 'prd_tf_deliver',
);

/**
 * Field
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
    'table'            => $Table['deliver'],
    'clause'        => "WHERE id = '" . $id . "'",
    'action'        => "update",
    'description'    => "Edit DTF (" . $kode . ")"
);
$History = Core::History($HistoryField);
$Field = array(
    'tanggal'       => $tanggal_send,
    'update_by'        => Core::GetState('id'),
    'update_date'    => $Date,
    'history'        => $History
);
//=> / END : Field

if ($is_reception == 1) {

    //===================
    // RECEIVE
    if ($rcv == 0) {
        $DB->ManualCommit();

        $DB->Update(
            $Table['deliver'],
            array(
                'rcv' => 1
            ),
            "id = '" . $id . "'"
        );
    }

    /**
     * Material
     */
    for ($i = 0; $i < sizeof($material); $i++) {
        if (
            !empty($material[$i]['id_detail']) &&
            $material[$i]['qty_receive'] > 0
        ) {

            $FieldDetail = array(
                'qty_receive'   => $material[$i]['qty_receive'],
            );

            if ($DB->Update(
                $Table['deliver'] . '_detail',
                $FieldDetail,
                "id = '" . $material[$i]['id_detail'] . "'"
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
     * Others
     */
    for ($i = 0; $i < sizeof($list); $i++) {
        if (
            !empty($list[$i]['id_detail']) &&
            $list[$i]['qty_receive'] > 0
        ) {

            $FieldDetail = array(
                'qty_receive'       => $list[$i]['qty_receive'],
            );

            if ($DB->Update(
                $Table['deliver'] . '_detail',
                $FieldDetail,
                "id = '" . $list[$i]['id_detail'] . "'"
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
    // => End Others
    $DB->Commit();

    $return['status'] = 1;
} else {

    //===================
    // SEND
    $DB->ManualCommit();

    /**
     * Update Data
     */
    if ($DB->Update(
        $Table['deliver'],
        $Field,
        "id = '" . $id . "'"
    )) {

        //=> Remove All Previous Detail
        if ($DB->Delete(
            $Table['deliver'] . '_detail',
            "header = '" . $id . "'"
        )) {

            /**
             * Material
             */
            for ($i = 0; $i < sizeof($material); $i++) {

                if ($material[$i]['qty'] > 0) {

                    $Field = array(
                        'header'    => $id,
                        'tipe'      => 1,
                        'item'      => $material[$i]['id'],
                        'qty_ref'   => $material[$i]['qty_ref'],
                        'qty'       => $material[$i]['qty'],
                        'remarks'   => $material[$i]['remarks'],
                        'storeloc'       => $material[$i]['storeloc'],
                        'storeloc_kode'  => $material[$i]['storeloc_kode'],
                        'storeloc_nama'  => $material[$i]['storeloc_nama'],
                    );

                    $return['material'][$i] = $Field;

                    if ($DB->Insert(
                        $Table['deliver'] . "_detail",
                        $Field
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
            // => End Material

            /**
             * Others
             */
            for ($i = 0; $i < sizeof($list); $i++) {

                if ($list[$i]['qty'] > 0) {

                    $Field = array(
                        'header'    => $id,
                        'tipe'      => 4,
                        'item'      => $list[$i]['id'],
                        'qty_ref'   => $list[$i]['qty_ref'],
                        'qty'       => $list[$i]['qty'],
                        'remarks'   => $list[$i]['remarks'],
                        'storeloc'       => $list[$i]['storeloc'],
                        'storeloc_kode'  => $list[$i]['storeloc_kode'],
                        'storeloc_nama'  => $list[$i]['storeloc_nama']
                    );

                    $return['list'][$i] = $Field;

                    if ($DB->Insert(
                        $Table['deliver'] . "_detail",
                        $Field
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
            //=> End Others
            $DB->Commit();

            $return['status'] = 1;
        }
    } else {
        $return = array(
            'status'    => 0,
            'error_msg' => $GLOBALS['mysql']->error
        );
    }
    //=> / END : Update Data

}

echo Core::ReturnData($return);

?>