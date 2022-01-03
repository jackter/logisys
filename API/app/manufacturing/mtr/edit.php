<?php

$Modid = 64;
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
$list = json_decode($list, true);

$Table = array(
    'def'       => 'prd_tf',
    'detail'    => 'prd_tf_detail'
);

/**
 * Field
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
    'table'         => $Table['def'],
    'clause'        => "WHERE id = '" . $id . "'",
    'action'        => "update",
    'description'   => "Edit MTR (" . $kode . ")"
);
$History = Core::History($HistoryField);
$Field = array(

    'remarks'        => $note,
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

            /**
             * Material
             */
            for ($i = 0; $i < sizeof($material); $i++) {
                if (!empty($material[$i]['id'])) {

                    $FieldDetail = array(
                        'header'    => $Header['id'],
                        'tipe'      => 1,
                        'item'      => $material[$i]['id'],
                        'qty'       => $material[$i]['qty'],
                        'remarks'   => $material[$i]['remarks']
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
             * Others
             */
            for ($i = 0; $i < sizeof($list); $i++) {
                if (!empty($list[$i]['id'])) {

                    $FieldDetail = array(
                        'header'    => $Header['id'],
                        'tipe'      => 4,
                        'item'      => $list[$i]['id'],
                        'qty'       => $list[$i]['qty'],
                        'remarks'   => $list[$i]['remarks']
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
            // => End Others
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