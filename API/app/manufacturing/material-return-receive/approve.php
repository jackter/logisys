<?php

$Modid = 191;
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
    'def'       => 'prd_tf_return',
    'detail'    => 'prd_tf_deliver_detail',
);

$list = json_decode($list_send, true);

/**
 * Update Verify
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
    'table'         => $Table['def'],
    'clause'        => "WHERE id = '" . $id . "'",
    'action'        => "approve",
    'description'   => "Approve Return Material Receive " . $kode
);
$History = Core::History($HistoryField);

$Field = array(
    'approved'      => 1,
    'approved_by'   => Core::GetState('id'),
    'approved_date' => $Date,
    'update_by'     => Core::GetState('id'),
    'update_date'   => $Date,
    'history'       => $History
);
$DB->ManualCommit();

if ($DB->Update(
    $Table['def'],
    $Field,
    "id = '" . $id . "'"
)) {
    /**
     * List
     */
    for ($i = 0; $i < sizeof($list); $i++) {
        if ($list[$i]['qty_return'] > 0) {
            $FieldJurnal = array(
                'tipe'      => 'credit',
                'company'   => $company,
                'dept'      => $dept,
                'storeloc'  => $list[$i]['storeloc'],
                'item'      => $list[$i]['item'],
                'qty'       => $list[$i]['qty_return'],
                'price'     => $list[$i]['price'],
                'kode'      => $kode,
                'tanggal'   => $tanggal,
                'keterangan'    => 'Return Material Receive ' . $kode
            );
            App::JurnalStock($FieldJurnal);

            /**
             * Get Qty Return
             */
            $Q_Qty = $DB->Query(
                $Table['detail'],
                array(
                    'qty_receive_return'
                ),
                "
                    WHERE
                        id = '" . $list[$i]['id_deliver_detail'] . "'
                "
            );
            $R_Qty = $DB->Row($Q_Qty);

            if($R_Qty > 0) {
                $Qty = $DB->Result($Q_Qty);

                /**
                 * Update Qty Return
                 */
                $DB->Update(
                    $Table['detail'],
                    array(
                        'qty_receive_return' => $list[$i]['qty_return'] + $Qty['qty_receive_return'],
                    ),
                    "id = '" . $list[$i]['id_deliver_detail'] . "'"
                );
                //=> END : Update Qty Return
            }
            //=> END : Get Qty Return
        }
    }
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