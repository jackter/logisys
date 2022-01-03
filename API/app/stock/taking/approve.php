<?php
$Modid = 38;

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
    'def'       => 'stock_taking',
    'detail'    => 'stock_taking_detail'
);

/**
 * Update Approve
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
	'table'			=> $Table['def'],
	'clause'		=> "WHERE id = '" . $id . "'",
	'action'		=> "approve",
	'description'	=> "Approve Stock Taking " . $kode
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
    /**
     * Notification
     */
    $STK = $DB->Result($DB->Query(
        $Table['def'],
        array(
            'company',
            //'dept',
            'kode',
            'remarks',
            'storeloc',
            'create_by'
        ),
        "WHERE id = '" . $id . "'"
    ));
    Notif::Send(array(
        'company'       => $STK['company'],
        //'dept'          => $STK['dept'],
        'title'         => "APPROVE " . $STK['kode'],
        'content'       => '<strong>' . Core::GetUser('nama') . '</strong> APPROVE ' . $STK['kode'],
        'url'           => $sys_url,
        'data'          => array(
            'id'    => $id
        ),
        'sendback'      => array(
            $STK['create_by']
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
            'stock',
            'actual',
            'price',
            'selisih',
            'jurnal',
            'qty_jurnal'
        ),
        "
            WHERE
                header = '" . $id . "' AND 
                actual > 0
        "
    );
    $R_Detail = $DB->Row($Q_Detail);
    if($R_Detail > 0){
        while($Detail = $DB->Result($Q_Detail)){

            /**
             * Get Stock FROM
             */
            $Stock = App::GetStockItem(array(
                'company'       => $STK['company'],
                'storeloc'      => $STK['storeloc'],
                'item'          => $Detail['item']
            ));
            //=> / END : Get Stock FROM

            if(empty($Stock['price'])){
                $Stock['price'] = 1;
            }

            /**
             * Balance Jurnal Stock
             */
            $Jurnal = App::JurnalStock(array(
                'tipe'          => $Detail['jurnal'],
                'company'       => $STK['company'],
                'storeloc'      => $STK['storeloc'],
                'item'          => $Detail['item'],
                'qty'           => $Detail['qty_jurnal'],
                'price'         => $Stock['price'],
                'adj'           => 1,
                'kode'          => $STK['kode'],
                'keterangan'    => CLEANHTML($STK['remarks'])
            ));
            //=> / END : Balance Jurnal Stock

        }
    }
    //=> END : Extract Detail

    $DB->Commit();
    $return['status'] = 1;
}else{
    $return = array(
        'status'    => 0,
        'error_msg' => $GLOBALS['mysql']->error
    );
}
//=> / END: Update Verify

echo Core::ReturnData($return);
?>