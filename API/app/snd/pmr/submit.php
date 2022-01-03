<?php
$Modid = 29;

Perm::Check($Modid, 'receipt');

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

$Table = array(
    'def'       => 'mr',
    'detail'    => 'mr_detail'
);

$list = json_decode($list, true);

/**
 * Update Submit
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
	'table'			=> $Table['def'],
	'clause'		=> "WHERE id = '" . $id . "'",
	'action'		=> "receipt",
	'description'	=> "Submit MR " . $kode
);
$History = Core::History($HistoryField);

$Field = array(
    'note'              => $note,
    'processed'         => 1,
    'processed_by'		=> Core::GetState('id'),
	'processed_date'	=> $Date,
	'history'		    => $History
);

$DB->ManualCommit();

if($DB->Update(
    $Table['def'],
    $Field,
    "id = '" . $id . "'"
)){

    /**
     * Update Qty Approved
     */
    for($i = 0; $i < sizeof($list); $i++){

        if($list[$i]['qty_approved'] > 0){

            if(!empty($list[$i]['detail_id'])){
            
                if($DB->Update(
                    $Table['detail'],
                    array(
                        'qty_approved'          => $list[$i]['qty_approved'],
                        'qty_outstanding'       => $list[$i]['qty_approved'],
                        'remarks'               => $list[$i]['remarks'] 
                    ),
                    "id = '" . $list[$i]['detail_id'] . "'"
                )){
                    $return['status_approved'][$i]['status'] = 1;
                }else{
                    $return['status_approved'][$i] = array(
                        'status'    => 0,
                        'id'        => $list[$i]['detail_id']
                    );
                }

            }

        }

    }
    //=> / END : Qty Approved


    $DB->Commit();

    $return['status'] = 1;

    /**
     * Notification
     */
    $MR = $DB->Result($DB->Query(
        $Table['def'],
        array(
            'company',
            'dept',
            'kode',
            'create_by',
            'approved_by'
        ),
        "WHERE id = '" . $id . "'"
    ));
    Notif::Send(array(
        'company'       => $MR['company'],
        'dept'          => $MR['dept'],
        'title'         => "PROCESSED " . $MR['kode'],
        'content'       => '<strong>' . Core::GetUser('nama') . '</strong> PROCESSED ' . $MR['kode'],
        'url'           => $sys_url,
        'data'          => array(
            'id'    => $id
        ),
        'target'        => array(
            array(
                'modid'         => 29,  //PMR,
                'auth'          => 4    // GI
            ),
            array(
                'modid'         => 29,  //PMR,
                'auth'          => 5    // PR
            )
        ),
        'sendback'      => array(
            $MR['create_by'],
            $MR['approved_by']
        )
    ));
    //=> / END : Notification

}else{
    $return = array(
        'status'    => 0,
        'error_msg' => $GLOBALS['mysql']->error
    );
}
//=> / END: Update Submit

$return['field'] = $Field;

echo Core::ReturnData($return);
?>