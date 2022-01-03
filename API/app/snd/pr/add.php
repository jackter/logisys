<?php
$Modid = 30;

Perm::Check($Modid, 'add');

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
    'def'       => 'pr',
    'detail'    => 'pr_detail'
);

$DB->ManualCommit();

/**
 * Get POST Data
 */
$mr_id = $id;
$mr_kode = $kode;
//=> / END : Get POST Data

$Check = $DB->Row($DB->Query(
    $Table['def'],
    array('id'),
    "WHERE 
        mr = '" . $id . "' AND 
        is_void != 1
    "
));

if($Check <= 0){
    /**
     * Create Code
     */
    $Time = date('y') . "/";
    $Time2 = romawi(date('n')) . "/";
    $InitialCode = "PR/" . strtoupper($company_abbr) . "-" . strtoupper($dept_abbr) . "/" . $Time . $Time2;
    $InitialCodeCheck = "PR/" . strtoupper($company_abbr) . "%/" . $Time;
    $Len = 4;
    $LastKode = $DB->Result($DB->Query(
        $Table['def'],
        array('kode'),
        "
            WHERE
                kode LIKE '" . $InitialCodeCheck . "%' 
            ORDER BY 
                SUBSTR(kode, -$Len, $Len) DESC
        "
    ));
    $LastKode = (int)substr($LastKode['kode'], -$Len) + 1;
    $LastKode = str_pad($LastKode, $Len, 0, STR_PAD_LEFT);

    $kode = $InitialCode . $LastKode;
    //=> / END : Create Code

    /**
     * Field
     */
    $Date = date("Y-m-d H:i:s");

    $HistoryField = array(
        'table'			=> $Table['def'],
        'clause'		=> "WHERE kode = '" . $kode . "'",
        'action'		=> "add",
        'description'	=> "Create New Purchase Request From " . $mr_kode . " (" . $kode . ")"
    );
    $History = Core::History($HistoryField);
    $Field = array(
        'company'       => $company,
        'company_abbr'  => $company_abbr,
        'company_nama'  => $company_nama,
        'dept'          => $dept,
        'dept_abbr'     => $dept_abbr,
        'dept_nama'     => $dept_nama,
        'kode'          => $kode,
        'tanggal'       => date("Y-m-d"),
        'mr'            => $mr_id,
        'mr_kode'       => $mr_kode,
        'create_by'		=> Core::GetState('id'),
        'create_date'	=> $Date,
        'history'		=> $History,
        'status'        => 1
    );
    //=> / END : Field

    /**
     * Insert Data
     */
    if($DB->Insert(
        $Table['def'],
        $Field
    )){

        /**
         * Insert Detail
         */
        $Q_Header = $DB->Query(
            $Table['def'], 
            array('id'), 
            "
                WHERE
                    kode = '" . $kode . "' AND
                    create_date = '" . $Date . "'
            "
        );
        $R_Header = $DB->Row($Q_Header);
        if($R_Header > 0){

            $Header = $DB->Result($Q_Header);

            /**
             * Notification
             */
            $MR = $DB->Result($DB->Query(
                'mr',
                array(
                    'company',
                    'dept',
                    'kode',
                    'create_by',
                    'approved_by'
                ),
                "WHERE id = '" . $mr_id . "'"
            ));
            Notif::Send(array(
                'company'       => $MR['company'],
                'dept'          => $MR['dept'],
                'title'         => "CREATED " . $kode,
                'content'       => '<strong>' . strtoupper(Core::GetUser('nama')) . '</strong> Create PR for ' . $MR['kode'],
                'url'           => $sys_url,
                'data'          => array(
                    'id'    => $Header['id']
                ),
                'target'        => array(
                    array(
                        'modid'         => $Modid,  //GI,
                        'auth'          => 2    // ADD
                    ),
                    array(
                        'modid'         => $Modid,  //GI,
                        'auth'          => 5    // VERIFY
                    )
                ),
                'sendback'      => array(
                    $MR['create_by'],
                    $MR['approved_by']
                )
            ));
            //=> / END : Notification

            for($i = 0; $i < sizeof($list); $i++){
                if(!empty($list[$i]['id'])){

                    $FieldDetail = array(
                        'header'            => $Header['id'],
                        'item'              => $list[$i]['id'],
                        'qty_mr'            => $list[$i]['qty_approved'],
                        'qty_purchase'      => $list[$i]['qty_purchase'],
                        'qty_outstanding'   => $list[$i]['qty_purchase'],
                        'est_price'         => $list[$i]['est_price'],
                        'remarks'           => $list[$i]['remarks'],
                    );

                    $return['detail'][$i] = $FieldDetail;

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

        }
        //=> / END : Insert Detail

        $DB->Commit();

        $return['status'] = 1;
    }else{
        $return = array(
            'status'    => 0,
            'error_msg' => $GLOBALS['mysql']->error
        );
    }
    //=> / END : Insert Data

}else{
    $return = array(
        'status'    => 0,
        'error_msg' => $mr_kode . " is already Purchased"
    );
}

echo Core::ReturnData($return);
?>