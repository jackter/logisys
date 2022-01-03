<?php

$Modid = 126;
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

$list = json_decode($list_send, true);

$Table = array(
    'def'       => 'prd_tf_return',
    'detail'    => 'prd_tf_return_detail'
);

/**
 * Field
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
    'table'         => $Table['def'],
    'clause'        => "WHERE id = '" . $id . "'",
    'action'        => "update",
    'description'   => "Edit Material Return Delivery (" . $kode . ")"
);
$History = Core::History($HistoryField);
$Field = array(
    'tanggal'        => $tanggal_send,
    'update_by'      => Core::GetState('id'),
    'update_date'    => $Date,
    'history'        => $History
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

            for ($i = 0; $i < sizeof($list); $i++) {
                if ($list[$i]['qty_return'] > 0) {

                    $FieldDetail = array(
                        'header'                => $Header['id'],
                        'id_deliver_detail'     => $list[$i]['id'],
                        'item'                  => $list[$i]['item'],
                        'qty_ref'               => $list[$i]['qty_ref'],
                        'qty_return'            => $list[$i]['qty_return'],
                        'remarks'               => $list[$i]['remarks'],
                        'storeloc'              => $list[$i]['storeloc'],
                        'storeloc_kode'         => $list[$i]['storeloc_kode'],
                        'storeloc_nama'         => $list[$i]['storeloc_nama'],
                        'price'                 => $list[$i]['price']
                    );

                    // $return['list'][$i] = $FieldDetail;

                    if ($DB->Insert(
                        $Table['detail'],
                        $FieldDetail
                    )) {
                        $return['status_detail'][$i] = array(
                            'index'     => $i,
                            'status'    => 1,
                        );
                    } else {
                        $return['status_detail'][$i] = array(
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

echo Core::ReturnData($return);

?>