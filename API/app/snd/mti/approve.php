<?php
$Modid = 130;

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
    'def'       => 'mti',
    'detail'    => 'mti_detail',
    'def_2'     => 'mto',
    'detail_2'  => 'mto_detail'
);

/**
 * Update Approve
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
	'table'			=> $Table['def'],
	'clause'		=> "WHERE id = '" . $id . "'",
	'action'		=> "approve",
	'description'	=> "Approve Material Trasfer In " . $kode
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
    $MTI = $DB->Result($DB->Query(
        $Table['def'],
        array(
            'company',
            'company_from',
            'kode',
            'remarks',
            'mto',
            'from_storeloc',
            'to_storeloc',
            'tanggal',
            'create_by'
        ),
        "WHERE id = '" . $id . "'"
    ));
    Notif::Send(array(
        'company'       => $MTI['company'],
        'title'         => "APPROVE " . $MTI['kode'],
        'content'       => '<strong>' . Core::GetUser('nama') . '</strong> APPROVE ' . $MTI['kode'],
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
             * Debit on TO
             */
            $Debit = App::JurnalStock(array(
                'tipe'          => 'debit',
                'company'       => $MTI['company'],
                'storeloc'      => $MTI['to_storeloc'],
                'item'          => $Detail['item'],
                'qty'           => $Detail['qty'],
                'price'         => $Detail['price'],
                'kode'          => $MTI['kode'],
                'keterangan'    => CLEANHTML($MTI['remarks']),
                'tanggal'       => $MTI['tanggal']
            ));
            //=> / END : Debit on TO

        }
    }

    $Q_Detail = $DB->Query(
        $Table['detail_2'],
        array(
            'qty_os'
        ),
        "
            WHERE
                header = '" . $MTI['mto'] . "'
        "
    );
    $total_os_qty = 0;
    $R_Detail = $DB->Row($Q_Detail);
    if($R_Detail > 0){
        while($Detail = $DB->Result($Q_Detail)){
            $total_os_qty += $Detail['qty_os'];
        }
    }

    if($total_os_qty == 0){
        $HistoryField = array(
            'table'			=> $Table['def_2'],
            'clause'		=> "WHERE id = '" . $MTI['mto'] . "'",
            'action'		=> "finish",
            'description'	=> "Finish MTO"
        );
        $History = Core::History($HistoryField);

        $Field = array(
            'finish'        => 1,
            'update_by'		=> Core::GetState('id'),
            'update_date'	=> $Date,
            'history'		=> $History
        );
        if($DB->Update(
            $Table['def_2'],
            $Field,
            "id = '" . $MTI['mto'] . "'"
        ));
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