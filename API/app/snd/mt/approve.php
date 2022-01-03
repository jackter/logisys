<?php
$Modid = 37;

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
    'def'       => 'mt',
    'detail'    => 'mt_detail'
);

/**
 * Update Approve
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
	'table'			=> $Table['def'],
	'clause'		=> "WHERE id = '" . $id . "'",
	'action'		=> "approve",
	'description'	=> "Approve Material Request " . $kode
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
    $MT = $DB->Result($DB->Query(
        $Table['def'],
        array(
            'company',
            //'dept',
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
        'company'       => $MT['company'],
        //'dept'          => $MT['dept'],
        'title'         => "APPROVE " . $MT['kode'],
        'content'       => '<strong>' . Core::GetUser('nama') . '</strong> APPROVE ' . $MT['kode'],
        'url'           => $sys_url,
        'data'          => array(
            'id'    => $id
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
            'qty'
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
             * Get Stock FROM
             */
            $Stock = App::GetStockItem(array(
                'company'       => $MT['company'],
                'storeloc'      => $MT['from_storeloc'],
                'item'          => $Detail['item']
            ));
            //=> / END : Get Stock FROM

             /**
             * Credit on From
             */
            $Credit = App::JurnalStock(array(
                'tipe'          => 'credit',
                'company'       => $MT['company'],
                'storeloc'      => $MT['from_storeloc'],
                'item'          => $Detail['item'],
                'qty'           => $Detail['qty'],
                'price'         => $Stock['price'],
                'kode'          => $MT['kode'],
                'keterangan'    => CLEANHTML($MT['remarks']),
                'tanggal'       => $MT['tanggal']
            ));
            //=> / END : Credit on From

            /**
             * Debit on TO
             */
            $Debit = App::JurnalStock(array(
                'tipe'          => 'debit',
                'company'       => $MT['company'],
                'storeloc'      => $MT['to_storeloc'],
                'item'          => $Detail['item'],
                'qty'           => $Detail['qty'],
                'price'         => $Stock['price'],
                'kode'          => $MT['kode'],
                'keterangan'    => CLEANHTML($MT['remarks']),
                'tanggal'       => $MT['tanggal']
            ));
            //=> / END : Debit on TO

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