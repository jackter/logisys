<?php
$Modid = 129;

Perm::Check($Modid, 'approve');

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
    'def'       => 'mto',
    'detail'    => 'mto_detail'
);

/**
 * Update Approve
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
	'table'			=> $Table['def'],
	'clause'		=> "WHERE id = '" . $id . "'",
	'action'		=> "approve",
	'description'	=> "Approve Material Request Out " . $kode
);
$History = Core::History($HistoryField);

$Field = array(
    'approved'      => 1,
    'approved_by'	=> Core::GetState('id'),
	'approved_date'	=> $Date,
	'history'		=> $History
);

$DB->ManualCommit();

if($DB->Update(
    $Table['def'],
    $Field,
    "id = '" . $id . "'"
)){

    $DB->Commit();

    $return['status'] = 1;

    /**
     * Notification
     */
    $MTO = $DB->Result($DB->Query(
        $Table['def'],
        array(
            'company',
            'kode',
            'remarks',
            'from_storeloc',
            'to_storeloc',
            'tanggal',
            'create_by'
        ),
        "WHERE id = '" . $id . "'"
    ));
    Notif::Send(array(
        'company'       => $MTO['company'],
        'title'         => "APPROVE " . $MTO['kode'],
        'content'       => '<strong>' . Core::GetUser('nama') . '</strong> APPROVE ' . $MTO['kode'],
        'url'           => $sys_url,
        'data'          => array(
        'id'            => $id
        ),
        'sendback'      => array(
            $MT['create_by']
        )
    ));
    //=> / END : Notification

    /**
     * Extract Detail
     */
    $Q_Detail = $DB->Query(
        $Table['detail'],
        array(
            'id',
            'item',
            'qty',
            'price'
        ),
        "
            WHERE
                header = '" . $id . "' AND 
                qty > 0
        "
    );
    $R_Detail = $DB->Row($Q_Detail);
    if($R_Detail > 0){
        while($Detail = $DB->Result($Q_Detail)){
             /**
             * Credit on From
             */
            $Credit = App::JurnalStock(array(
                'tipe'          => 'credit',
                'company'       => $MTO['company'],
                'storeloc'      => $MTO['from_storeloc'],
                'item'          => $Detail['item'],
                'qty'           => $Detail['qty'],
                'price'         => $Detail['price'],
                'kode'          => $MTO['kode'],
                'keterangan'    => CLEANHTML($MT['remarks']),
                'tanggal'       => $MTO['tanggal']
            ));
            //=> / END : Credit on From

        }
    }
    //=> END : Extract Detail
}else{
    $return = array(
        'status'    => 0,
        'error_msg' => $GLOBALS['mysql']->error
    );
}
//=> / END: Update Verify

echo Core::ReturnData($return);
?>