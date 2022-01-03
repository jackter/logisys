<?php

$Modid = 112;
Perm::Check($Modid, 'edit');

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
    'def'       => 'oip',
    'detail'    => 'oip_detail'
);

/**
 * Field
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
    'table'         => $Table['def'],
    'clause'        => "WHERE id = '" . $id . "'",
    'action'        => "add",
    'description'   => "Edit Oil In Plant"
);
$History = Core::History($HistoryField);

$list = json_decode($list, true);

$Field = array(
    'tanggal'           => $tanggal_send,
    'plant'             => $plant,
    'update_by'         => Core::GetState('id'),
    'update_date'       => $Date,
    'history'           => $History
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
    $return['status'] = 1;

    /**
     * Delete Detail Before Insert New
     */
    $DB->Delete(
        $Table['detail'],
        "header = '" . $id . "'"
    );
    //=> / END : Delete Detail Before Insert New

    for ($i = 0; $i < sizeof($list); $i++) {
        if (!empty($list[$i]['level'])) {

            $FieldDetail = array(
                'id_tpl'        => $list[$i]['id'],
                'header'        => $id,
                'plant'         => $plant,
                'item'          => $list[$i]['item'],
                'item_nama'     => $list[$i]['item_nama'],
                'vessel'        => $list[$i]['vessel'],
                'volume'        => $list[$i]['volume'],
                'density'       => $list[$i]['density'],
                'mt'            => $list[$i]['mt'],
                'level'         => $list[$i]['level'],
                'actual_oip'    => $list[$i]['actual_oip']
            );

            if ($DB->Insert(
                $Table['detail'],
                $FieldDetail
            )) {
                $return['status_detail'][$i] = array(
                    'index'     => $i,
                    'status'    => 1,
                );
            }
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
//>> End: Insert Data

echo Core::ReturnData($return);

?>