<?php
$Modid = 201;
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

$list = json_decode($list, true);

$Table = array(
    'def'       => 'prd_transfer_fg',
    'detail'    => 'prd_transfer_fg_detail'
);

/**
 * Field
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
    'table'         => $Table['def'],
    'clause'        => "WHERE id = '" . $id . "'",
    'action'        => "update",
    'description'   => "Edit TFG (" . $kode . ")"
);
$History = Core::History($HistoryField);

$Field = array(
    'tanggal'       => $tanggal_send,
    'remarks'       => $remarks,
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

    if ($DB->Delete(
        $Table['detail'],
        "header = '" . $id . "'"
    )) {

        for ($i = 0; $i < sizeof($list); $i++) {
            if (!empty($list[$i]['item'])) {

                $Field = array(
                    'header'            => $id,
                    'tipe'              => $list[$i]['tipe'],
                    'item'              => $list[$i]['item'],
                    'storeloc'          => $list[$i]['storeloc'],
                    'storeloc_kode'     => $list[$i]['storeloc_kode'],
                    'storeloc_nama'     => $list[$i]['storeloc_nama'],
                    'jo'                => $list[$i]['jo'],
                    'jo_kode'           => $list[$i]['jo_kode'],
                    'qty'               => $list[$i]['qty'],
                    'stock'             => $list[$i]['stock'],
                    'remarks'           => $list[$i]['remarks']
                );

                if ($DB->Insert(
                    $Table['detail'],
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
    }

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