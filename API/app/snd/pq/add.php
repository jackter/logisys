<?php
$Modid = 31;

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

$list = json_decode($supplier_list, true);

$Table = array(
    'def'       => 'pq',
    'supplier'  => 'pq_supplier'
);

/**
 * Get POST Data
 */
$pr_id = $id;
$pr_kode = $pr_kode;
//=> / END : Get Post Data

$DB->ManualCommit();

$Check = $DB->Row($DB->Query(
    $Table['def'],
    array('id'),
    "WHERE pr = '" . $id . "' AND is_void = 0"
));

if($Check <= 0){

    /**
     * Create Code
     */
    $Time = date('y') . "/";
    $Time2 = romawi(date('n')) . "/";
    $InitialCode = "RFQ/" . strtoupper($company_abbr) . "-" . strtoupper($dept_abbr) . "/" . $Time . $Time2;
    $InitialCodeCheck = "RFQ/" . strtoupper($company_abbr) . "%/" . $Time;
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
        'description'	=> "Create New Purchase Quotations From " . $pr_kode . " (" . $kode . ")"
    );
    $History = Core::History($HistoryField);
    $Field = array(
        'company'       => $company,
        'company_abbr'  => $company_abbr,
        'company_nama'  => $company_nama,
        'dept'          => $dept,
        'dept_abbr'     => $dept_abbr,
        'dept_nama'     => $dept_nama,
        'pr'            => $pr_id,
        'pr_kode'       => $pr_kode,
        'kode'          => $kode,
        'tanggal'       => date("Y-m-d"),
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
                "WHERE id = '" . $mr . "'"
            ));
            $PR = $DB->Result($DB->Query(
                'pr',
                array(
                    'create_by',
                    'approved_by',
                    'approved2_by',
                    'approved3_by'
                ),
                "
                    WHERE id = '" . $pr_id . "'
                "
            ));

            /**
             * Send Back
             */
            $SendBack = array(
                $MR['create_by'],
                $MR['approved_by'],
                $PR['create_by']
            );
            if(!empty($PR['approved_by'])){
                $SendBack[] = $PR['approved_by'];
            }
            if(!empty($PR['approved2_by'])){
                $SendBack[] = $PR['approved2_by'];
            }
            if(!empty($PR['approved3_by'])){
                $SendBack[] = $PR['approved3_by'];
            }
        
            $SendBack = array_unique($SendBack);
            //=> / END : Send Back

            Notif::Send(array(
                'company'       => $MR['company'],
                'dept'          => $MR['dept'],
                'title'         => "QUOTATION " . $kode,
                'content'       => '<strong>' . strtoupper(Core::GetUser('nama')) . '</strong> Initialize Quotations for ' . $pr_kode,
                'url'           => "/snd/pq",
                'data'          => array(
                    'id'    => $Header['id']
                ),
                'sendback'      => $SendBack
            ));
            //=> / END : Notification

            for($i = 0; $i < sizeof($list); $i++){
                if(!empty($list[$i]['id'])){

                    $FieldDetail = array(
                        'header'        => $Header['id'],
                        'supplier'      => $list[$i]['id'],
                        'kode'          => $list[$i]['kode'],
                        'nama'          => $list[$i]['nama'],
                        'remarks'       => $list[$i]['remarks'],
                    );

                    $return['supplier'][$i] = $FieldDetail;

                    if($DB->Insert(
                        $Table['supplier'],
                        $FieldDetail
                    )){
                        $return['status_supplier'][$i]= array(
                            'index'     => $i,
                            'status'    => 1,
                        );
                    }else{
                        $return['status_supplier'][$i] = array(
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
        'error_msg' => "Purchase Quotations for " . $pr_kode . " is already Exists"
    );
}

echo Core::ReturnData($return);

?>