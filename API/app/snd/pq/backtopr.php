<?php

$Modid = 31;
Perm::Check($Modid, 'back_pr');

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

$Table = array(
    'def'       => 'pq',
    'pr'        => 'pr',
    'po'        => 'po'
);

$Date = date("Y-m-d H:i:s");

$DB->ManualCommit();

/**
 * Check if Finish
 */
if ($finish == 1 && $ordered == 1) { // Back To PR if PQ == Finish

    /**
     * check PO is void
     */
    $PO = $DB->Result($DB->Query(
        $Table['po'],
        array(
            'kode',
            'is_void'
        ),
        "
            WHERE
                pr = '" . $id . "'
        "
    ));

    if ($PO['is_void'] != 1) {

        $return['data']['massege_void'] = $PO['kode'] . " Belum di Cancel";
    } else {

        $return['status'] = 1;
    }
    // >> end L check PO is void

} else
if ($ordered == 0) { //Back to PR if PQ == Draft

    /**
     * Back To PR
     */

    $HistoryField = array(
        'table'            => $Table['def'],
        'clause'        => "WHERE id = '" . $id . "'",
        'action'        => "back_mr",
        'description'    => "Roll Back Process PR " . $kode
    );
    $History = Core::History($HistoryField);

    $Field = array(
        'is_void'   => 1,
        'close_remarks' => $close_remarks,
        'void_by'   => Core::GetState('id'),
        'void_date' => $Date,
        'history'    => $History
    );

    if ($DB->Update(
        $Table['def'],
        $Field,
        "pr = '" . $pr . "'"
    )) {

        /**
         * Update PR
         */
        $HistoryField = array(
            'table'            => $Table['def'],
            'clause'        => "WHERE id = '" . $id . "'",
            'action'        => "back_mr",
            'description'    => "Roll Back Process From PQ " . $kode

        );
        $History = Core::History($HistoryField);

        $Field = array(
            'verified'      => 0,
            'approved'      => 0,
            'approved2'     => 0,
            'approved3'     => 0,
            'finish'        => 0,
            'update_by'        => Core::GetState('id'),
            'update_date'    => $Date,
            'history'        => $History
        );

        $DB->Update(
            $Table['pr'],
            $Field,
            "id = '" . $id . "'"
        );
        // >> End : Update PR

        $DB->Commit();

        $return['status'] = 1;
        
        /**
         * Notification
         */
        $PQ = $DB->Result($DB->Query(
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
            'company'       => $PQ['company'],
            'dept'          => $PQ['dept'],
            'title'         => "UNDO " . $PQ['kode'],
            'content'       => '<strong>' . Core::GetUser('nama') . '</strong> UNDO ' . $PQ['kode'] . ', PR is Available to Modify Now.',
            'url'           => $sys_url,
            'data'          => array(
                'id'    => $id
            ),
            'target'        => array(
                array( // PR Approve2
                    'modid'         => 30,
                    'auth'          => 8
                ),
                array( // PR Approve2
                    'modid'         => 30,
                    'auth'          => 7
                ),
                array( // PR Approve
                    'modid'         => 30,
                    'auth'          => 6
                ),
                array( // PR Verify
                    'modid'         => 30,
                    'auth'          => 5
                ),
            ),
            'sendback'      => array(
                $PQ['create_by']
            )
        ));
        //=> / END : Notification
    } else {
        $return = array(
            'status'    => 0,
            'error_msg' => "We Have a problem to undo this process, please call Administrator."
        );
    }
    //=> END :  Back To PR
}
// >> End : Check if Finish

echo Core::ReturnData($return);

?>