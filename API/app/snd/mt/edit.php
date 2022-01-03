<?php
$Modid = 37;

Perm::Check($Modid, 'edit');

//=> Default Statement
$return = [];
$RPL	= "";
$SENT   = Core::Extract($_POST, $RPL);

//=> Extract Array
if(isset($SENT)){
    foreach($SENT as $KEY => $VAL){	
        $$KEY = $VAL;
    }
}

$list = json_decode($list, true);

$Table = array(
    'def'       => 'mt',
    'detail'    => 'mt_detail',
    'stock'     => 'storeloc_stock'
);

/**
 * Field
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
	'table'			=> $Table['def'],
	'clause'		=> "WHERE id = '" . $id . "'",
	'action'		=> "edit",
	'description'	=> "Edit MT"
);
$History = Core::History($HistoryField);
$Field = array(
    'tanggal'       => $tanggal_send,
    'remarks'       => $remarks,
    'update_by'		=> Core::GetState('id'),
	'update_date'	=> $Date,
	'history'		=> $History
);
//=> / END : Field

$DB->ManualCommit();

/**
 * Update Data
 */
if($DB->Update(
    $Table['def'],
    $Field,
    "id = '" . $id . "' AND verified = 0"
)){
    /**
     * Delete Detail Before Insert New
     */
    $DB->Delete(
        $Table['detail'],
        "header = '" . $id . "'"
    );
    //=> / END : Delete Detail Before Insert New

    /**
     * Insert Detail
     */
    for($i = 0; $i < sizeof($list); $i++){
        if($list[$i]['qty'] > 0){

            $FieldDetail = array(
                'header'    => $id,
                'item'      => $list[$i]['id'],
                'qty'       => $list[$i]['qty'],
                'price'     => $list[$i]['price'],  //=> Sesuaikan ketika verify
            );

            if($DB->Insert(
                $Table['detail'],
                $FieldDetail
            )){
                $return['status_detail'][$i]= array(
                    'index'     => $i,
                    'status'    => 1,
                );
            }else{
                $return['status_detail'][$i] = array(
                    'index'     => $i,
                    'status'    => 0,
                    'error_msg' => $GLOBALS['mysql']->error
                );
            }

        }
    }
    //=> / END : Insert Detail

    $DB->Commit();

    $return['status'] = 1;

}

echo Core::ReturnData($return);
?>