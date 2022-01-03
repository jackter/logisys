<?php
$Modid = 30;

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
    'def'       => 'pr',
    'detail'    => 'pr_detail'
);

/**
 * Field
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
	'table'			=> $Table['def'],
	'clause'		=> "WHERE id = '" . $id . "'",
	'action'		=> "edit",
	'description'	=> "Edit PR"
);
$History = Core::History($HistoryField);
$Field = array(
    'update_by'		=> Core::GetState('id'),
	'update_date'	=> $Date,
	'history'		=> $History
);
//=> / END : Field

$DB->ManualCommit();

# Update Data
if ($DB->Update(
    $Table['def'],
    $Field,
    "
        id = '" . $id . "'
    "
)) {
    #Delete Detail Before Insert New
    $DB->Delete(
        $Table['detail'],
        "header = '" . $id . "'"
    );

    #Insert Detail
    for ($i = 0; $i < sizeof($list); $i++) {
        if (!empty($list[$i]['id'])) {
            $FieldDetail = array(
                'header'            => $id,
                'item'              => $list[$i]['id'],
                'qty_mr'            => $list[$i]['qty_approved'],
                'qty_purchase'      => $list[$i]['qty_purchase'],
                'qty_outstanding'   => $list[$i]['qty_purchase'],
                'est_price'         => $list[$i]['est_price'],
                'remarks'           => $list[$i]['remarks']
            );

            $return['detail'][$i] = $FieldDetail;

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