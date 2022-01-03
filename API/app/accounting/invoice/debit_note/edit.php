<?php

$Modid = 216;
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
    'def'       => 'deb_note',
    'detail'    => 'deb_note_detail',
);


$list = json_decode($list_send, true);

/**
 * Field
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
    'table'         => $Table['def'],
    'clause'        => "WHERE id = '" . $id . "'",
    'action'        => "edit",
    'description'   => "Edit Debit Note"
);
$History = Core::History($HistoryField);

$Field = array(
    'grandtotal'    => $totalExpAmount,
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
    "
        id = '" . $id . "'
    "
)) {
    

    /**
     * Update Expense
     */
    if(!empty($list)){
        if($DB->Delete(
            $Table['detail'],
            "
                header = '" . $id. "'
            "
        )){
            
            for ($i = 0; $i < sizeof($list); $i++) {
                if ($list[$i]['coa'] > 0 && $list[$i]['amount'] != 0) {
                    $FieldDetail = array(
                        'header'    => $id,
                        'coa'       => $list[$i]['coa'],
                        'coa_kode'  => $list[$i]['kode'],
                        'coa_nama'  => $list[$i]['nama'],
                        'jumlah'    => $list[$i]['amount'],
                        'keterangan'=> $list[$i]['notes']
                    );

                    $DB->Insert(
                        $Table['detail'],
                        $FieldDetail
                    );
                }
            }
        }
    }   
    // => End : Update Expense

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