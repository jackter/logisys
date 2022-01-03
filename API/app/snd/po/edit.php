<?php

# Default Statement
$return = [];
$RPL = "";
$SENT = COre::Extract($_POST, $RPL);

# Extract Array
if (isset($SENT)) {
    foreach ($SENT as $KEY => $VAL) {
        # code...
        $$KEY = $VAL;
    }
}

$Table = array(
    'def' => 'po',
    'detail' => 'po_detail'
);

# Field
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
    'table'            => $Table['def'],
    'clause'        => "WHERE id = '" . $id . "'",
    'action'        => "edit",
    'description'    => "Edit PO"
);
$History = Core::History($HistoryField);

$Field = array(
    'note'              => $note,
    'update_by'         => Core::GetState('id'),
    'update_date'       => $Date,
    'history'           => $History,
);

$detail = json_decode($list, true);

$DB->ManualCommit();

# Update Data 
if ($DB->Update(
    $Table['def'],
    $Field,
    "id = '" . $id . "'"
)) {
    for($i = 0; $i < sizeof($detail); $i++){
        // if(
        //     !empty($detail[$i]['remarks']) &&
        //     !empty($detail[$i]['origin_quality']) 
        // ) {
            
        // }

        $FieldDetail = array(
            'remarks'           => $detail[$i]['remarks'],
            'origin_quality'    => $detail[$i]['origin_quality']
        );
        $return['detail'][$i] = array(
            'id'                => $detail[$i]['detail_id'],
            'remarks'           => $detail[$i]['remarks'],
            'origin_quality'    => $detail[$i]['origin_quality']
        );

        # Update Detail
        if ($DB->Update(
            $Table['detail'],
            $FieldDetail,
            "id = '" . $detail[$i]['detail_id'] . "'"
        )) {
            $return['status_detail'][$i] = array(
                'index' => $i,
                'status' => 1,
            );
        } else {
            $return['status_detail'][$i] = array(
                'index' => $i,
                'status' => 0,
                'error_msg' => $GLOBALS['mysql']->error
            );
        }

    }

    // for ($i = 0; $i < sizeof($detail); $i++) {
    //     if(
    //         !empty($detail[$i]['remarks']) &&
    //         !empty($detail[$i]['origin_quality']) 
    //     ) {
    //         $FieldDetail = array(
    //             'header' => $id,
    //             'remarks' => $detail[$i]['remarks'],
    //             'origin_quality' => $detail[$i]['origin_quality']
    //         );

    //         $return['detail'][$i] = $FieldDetail;
    //         # Insert Detail
    //         if ($DB->Insert(
    //             $Table['detail'],
    //             $FieldDetail
    //         )) {
    //             $return['status_detail'][$i] = array(
    //                 'index' => $i,
    //                 'status' => 1,
    //             );
    //         } else {
    //             $return['status_detail'][$i] = array(
    //                 'index' => $i,
    //                 'status' => 0,
    //                 'error_msg' => $GLOBALS['mysql']->error
    //             );
    //         }
    //     }
    // }

    $DB->Commit();

    $return['status'] = 1;

} else {
    $return = array(
        'status' => 0,
        'error_msg' => 'Gagal Menyimpan Data'
    );
}

echo Core::ReturnData($return);

?>