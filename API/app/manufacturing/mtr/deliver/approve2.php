<?php

exit();

$Modid = 64;
Perm::Check($Modid, 'approve');

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
    'def'       => 'prd_tf_deliver',
    'detail'    => 'prd_tf_deliver_detail',
    'prd_det'   => 'prd_tf_detail'
);

$list = json_decode($list, true);
$material = json_decode($material, true);

/**
 * Update Verify
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
    'table'         => $Table['def'],
    'clause'        => "WHERE id = '" . $id . "'",
    'action'        => "approve",
    'description'   => "Approve DTR " . $kode
);
$History = Core::History($HistoryField);

$Field = array(
    'approved'       => 1,
    'approved_by'    => Core::GetState('id'),
    'approved_date'  => $Date,
    'update_by'      => Core::GetState('id'),
    'update_date'    => $Date,
    'history'        => $History
);
$DB->ManualCommit();

if ($DB->Update(
    $Table['def'],
    $Field,
    "id = '" . $id . "'"
)) {

    /**
     * Update Receive
     */
    for ($i = 0; $i < sizeof($material); $i++) {

        /**
         * Update di tabel prd_tf_deliver_detail
         */
        $FieldDetail = array(
            'qty_receive'   => $material[$i]['qty_receive']
        );
        $DB->Update(
            $Table['detail'],
            $FieldDetail,
            "
                header = '" . $id . "' AND
                tipe   = 1 AND
                item   = '" . $material[$i]['id'] . "'
            "
        );
        // => End Update di tabel prd_tf_deliver_detail

        /**
         * Update di tabel prd_tf_detail
         */
        $FieldDetail2 = array(
            'qty_receive'   => $material[$i]['qty_receive'] + $material[$i]['qty']
        );

        $return['qty_receive_prd'] = $FieldDetail2;

        $DB->Update(
            $Table['prd_det'],
            $FieldDetail2,
            "
                header = '" . $prd . "' AND
                tipe   = 1 AND
                item   = '" . $material[$i]['id'] . "'
            "
        );
        //=> End Update di tabel prd_tf_detail
    }

    for ($i = 0; $i < sizeof($list); $i++) {

        /**
         * Update di tabel prd_tf_deliver_detail
         */
        $FieldDetail = array(
            'qty_receive'   => $list[$i]['qty_receive']
        );
        $DB->Update(
            $Table['detail'],
            $FieldDetail,
            "
                header = '" . $id . "' AND
                tipe   = 4 AND
                item   = '" . $list[$i]['id'] . "'
            "
        );
        // => End Update di tabel prd_tf_deliver_detail


        /**
         * Update di tabel prd_tf_detail
         */
        $FieldDetail2 = array(
            'qty_receive'   => $list[$i]['qty_receive'] + $list[$i]['qty']
        );

        $return['qty_receive_prd_2'][$i] = $FieldDetail2;

        $DB->Update(
            $Table['prd_det'],
            $FieldDetail2,
            "
                header = '" . $prd . "' AND
                tipe   = 4 AND
                item   = '" . $list[$i]['id'] . "'
            "
        );
        //=> End Update di tabel prd_tf_detail
    }

    // => End Update Receive
    $DB->Commit();

    $return['status'] = 1;
} else {
    $return = array(
        'status'    => 0,
        'error_msg' => $GLOBALS['mysql']->error
    );
}
//=> / END: Update Verify

echo Core::ReturnData($return);

?>