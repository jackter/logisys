<?php
$Modid = 32;

Perm::Check($Modid, 'back_pq');

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
    'def'       => 'po',
    'detail'    => 'po_detail',
    'prd'       => 'pr_detail',
    'pq'        => 'pq'
);

$Date = date("Y-m-d H:i:s");

$HistoryField = array(
	'table'			=> $Table['def'],
	'clause'		=> "WHERE id = '" . $id . "'",
	'action'		=> "back_pq",
	'description'	=> "Roll Back Process PQ " . $kode
);
$History = Core::History($HistoryField);
    
$Field = array(
    'submited'      => 0,
    'finish'        => 0,
    'is_void'       => 1,
    'close_remarks' => $close_remarks,
    'void_by'       => Core::GetState('id'),
    'void_date'     => $Date,
    'update_by'		=> Core::GetState('id'),
    'update_date'	=> $Date,
    'history'		=> $History
);

$DB->ManualCommit();

if($DB->Update(
    $Table['def'],
    $Field,
    "id = '" . $id . "'"
)){
    // $return['status'] = 1;

    /**
     * Get Detail PO
     */
    $Q_Detail = $DB->Query(
        $Table['detail'],
        array(
            'item',
            'qty_po'
        ),
        "
            WHERE
                header = '" . $id . "'
        "
    );
    $R_Detail = $DB->Row($Q_Detail);
    
    if($R_Detail > 0){

        $i = 0;
        while($Detail = $DB->Result($Q_Detail)){

            $return['data'][$i] = $Detail;

            /**
             * Get Detail PR
             */
            $CurrentOutstanding = $DB->Result($DB->Query(
                $Table['prd'],
                array(
                    'qty_outstanding'
                ),
                "
                    WHERE
                        item = '" . $Detail['item'] . "' AND
                        header = '" . $pr . "'
                "
            ));
            $NewOutstanding = $CurrentOutstanding['qty_outstanding'] + $Detail['qty_po'];

            $return['out'][$i] = $NewOutstanding;
            //=> END : Get Detail PR

            if($NewOutstanding < 0){
                $NewOutstanding = 0;
            }

            /**
             * Update qty_outstanding PR detail
             */
            if($DB->Update(
                $Table['prd'],
                array(
                    'qty_outstanding' => $NewOutstanding
                ),
                "
                    item = '" . $Detail['item'] . "' AND
                    header = '" . $pr . "'
                "
            )){
                $return['detail'][$i]['update_outstanding'] = array(
                    'status' => 1,
                    'header' => $pr,
                    'item' => $Detail['item']
                );
            }
            //=> END : Update qty_outstanding PR detail

            $HistoryFields = array(
                'table'			=> $Table['def'],
                'clause'		=> "WHERE id = '" . $id . "'",
                'action'		=> "back_pq",
                'description'	=> "Roll Back Process From PO " . $kode
            );
            $HistoryPO = Core::History($HistoryFields);

            /**
             * Update Draft PQ
             */
            if($DB->Update(
                $Table['pq'],
                array(
                    'verified'      => 0,
                    'approved'      => 0,
                    'approved2'     => 0,
                    'approved3'     => 0,
                    'finish'        => 0,
                    'update_by'		=> Core::GetState('id'),
                    'update_date'	=> $Date,
                    'history'		=> $HistoryPO
                ),
                "
                    id = '" . $pq . "'
                "
            )){

                $DB->Commit();

                $return['status'] = 1;

                /**
                 * Notification
                 */
                $PO = $DB->Result($DB->Query(
                    $Table['def'],
                    array(
                        'company',
                        'dept',
                        'kode',
                        'create_by'
                    ),
                    "WHERE id = '" . $id . "'"
                ));
                Notif::Send(array(
                    'company'       => $PO['company'],
                    'dept'          => $PO['dept'],
                    'title'         => "UNDO " . $PO['kode'],
                    'content'       => '<strong>' . Core::GetUser('nama') . '</strong> UNDO ' . $PO['kode'] . ', PQ is Available to Modify Now.',
                    'url'           => $sys_url,
                    'data'          => array(
                        'id'    => $id
                    ),
                    'target'        => array(
                        array( // PO Approve CEO
                            'modid'         => 31,
                            'auth'          => 8
                        ),
                        array( // PO Approve Dirkom
                            'modid'         => 31,
                            'auth'          => 7
                        ),
                        array( // PO Approve
                            'modid'         => 31,
                            'auth'          => 6
                        ),
                        array( // PO Verify
                            'modid'         => 31,
                            'auth'          => 5
                        ),
                    ),
                    'sendback'      => array(
                        $PO['create_by']
                    )
                ));
                //=> / END : Notification
            }
            //=> END : Update Draft PQ

            $i++;
        }
    }
    //=> END : Get Detail PO
   
}else{
    $return = array(
        'status'    => 0,
        'error_msg' => "We Have a problem to undo this process, please call Administrator."
    );
}

echo Core::ReturnData($return);
?>