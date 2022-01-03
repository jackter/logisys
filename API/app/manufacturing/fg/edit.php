<?php

$Modid = 65;
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

$output = json_decode($output, true);

$Table = array(
    'def'       => 'transfer_fg',
    'detail'    => 'transfer_fg_detail'
);

/**
 * Field
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
    'table'            => $Table['def'],
    'clause'        => "WHERE id = '" . $id . "'",
    'action'        => "update",
    'description'    => "Edit TFG (" . $kode . ")"
);
$History = Core::History($HistoryField);
$Field = array(
    'remarks'       => $note,
    'update_by'        => Core::GetState('id'),
    'update_date'    => $Date,
    'history'        => $History
);
//=> / END : Field

/**
 * Insert Data
 */
if ($is_reception == 1) { // RECEIVE PROCES

    if ($rcv == 0) {
        $DB->ManualCommit();

        if ($DB->Update(
            $Table['def'],
            array(
                'rcv'   => 1
            ),
            "id = '" . $id . "'"
        )) {
            /**
             * Update Tabel detail
             */
            for ($i = 0; $i < sizeof($output); $i++) {
                if ($output[$i]['qty_receive'] > 0) {

                    $FieldDetail = array(
                        'qty_receive'    => $output[$i]['qty_receive'],
                        'storeloc'       => $output[$i]['storeloc'],
                        'storeloc_kode'  => $output[$i]['storeloc_kode'],
                        'storeloc_nama'  => $output[$i]['storeloc_nama'],
                    );

                    if ($DB->Update(
                        $Table['detail'],
                        $FieldDetail,
                        "id = '" . $output[$i]['id_detail'] . "'"
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
            //=> End Update Tabel detail
            $DB->Commit();

            $return['status'] = 1;
        } else {
            $return = array(
                'status'    => 0,
                'error_msg' => $GLOBALS['mysql']->error
            );
        }
    }
} else { // EDIT SEND PROSES
    $DB->ManualCommit();

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

                for ($i = 0; $i < sizeof($output); $i++) {
                    if ($output[$i]['qty_send'] > 0) {

                        $FieldDetail = array(
                            'header'    => $Header['id'],
                            'item'      => $output[$i]['id'],
                            'qty'       => $output[$i]['qty_send'],
                            'price'     => $output[$i]['price']
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
            }
            //=> End Delete
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
}

echo Core::ReturnData($return);

?>