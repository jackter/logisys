<?php
$Modid = 36;

Perm::Check($Modid, 'goods_issued');

//=> Default Statement
$return = [];
$RPL	= "";
$SENT	= Core::Extract($_POST, $RPL);

//=> Extract Array
if(isset($SENT)){
    foreach($SENT as $KEY => $VAL){	
        $$KEY = $VAL;
    }
}

$Table = array(
    'def'       => 'mr',
    'detail'    => 'mr_detail',
    'gi'        => 'gi',
    'gid'       => 'gi_detail'
);

/**
 * Clean Data
 */
$list = json_decode($detail, true);
$mr_id = $id;
$mr_kode = $kode;
//=> / END : Clean Data

/**
 * Create Code
 */
$Time = date('y') . "/";
$Time2 = romawi(date('n')) . "/";
$InitialCode = "GI/" . strtoupper($company_abbr) . "-" . strtoupper($dept_abbr) . "/" . $Time . $Time2;
$InitialCodeCheck = "GI/" . strtoupper($company_abbr) . "%/" . $Time;
$Len = 4;
$LastKode = $DB->Result($DB->Query(
    $Table['gi'],
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
	'description'	=> "Goods Issued by Material Request (" . $kode . ")"
);
$History = Core::History($HistoryField);
$Field = array(
    'company'           => $company,
    'company_abbr'      => $company_abbr,
    'company_nama'      => $company_nama,
    'dept'              => $dept,
    'dept_abbr'         => $dept_abbr,
    'dept_nama'         => $dept_nama,
    'cost_center'       => $cost,
    'cost_center_kode'  => $cost_kode,
    'cost_center_nama'  => $cost_nama,
    'kode'              => $kode,
    'tanggal'           => $tanggal_send,
    'mr'                => $mr_id,
    'mr_kode'           => $mr_kode,
    'remarks'           => CLEANHTML($remarks),
    'verified'          => 1,
    'create_by'		    => Core::GetState('id'),
	'create_date'	    => $Date,
    'history'		    => $History,
    'status'		    => 1
);
//=> / END : Field

$DB->ManualCommit();

/**
 * Insert Data
 */
if($DB->Insert(
    $Table['gi'],
    $Field
)){

    /**
     * Insert Detail
     */
    $Q_Header = $DB->Query(
        $Table['gi'], 
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
            $Table['def'],
            array(
                'company',
                'dept',
                'kode',
                'create_by',
                'approved_by'
            ),
            "WHERE id = '" . $Header['id'] . "'"
        ));
        Notif::Send(array(
            'company'       => $MR['company'],
            'dept'          => $MR['dept'],
            'title'         => "ISSUED " . $MR['kode'],
            'content'       => '<strong>' . Core::GetUser('nama') . '</strong> GOODS ISSUED ' . $MR['kode'],
            'url'           => $sys_url,
            'data'          => array(
                'id'    => $id
            ),
            'target'        => array(
                array(
                    'modid'         => $Modid,  //GI,
                    'auth'          => 2    // goods_issued
                )
            ),
            'sendback'      => array(
                $MR['create_by'],
                $MR['approved_by']
            )
        ));
        //=> / END : Notification

        /**
         * Extract List
         */
        for($i = 0; $i < sizeof($list); $i++){
            if($list[$i]['qty_gi'] > 0){

                /**
                 * Insert GI Detail
                 */
                $FieldDetail = array(
                    'header'                => $Header['id'],
                    'item'                  => $list[$i]['id'],
                    'qty_mr'                => $list[$i]['qty_approved'],
                    'qty_gi'                => $list[$i]['qty_gi'],
                    'price'                 => $list[$i]['price'],
                    'cost_center'           => $list[$i]['cost_center'],
                    'cost_center_kode'      => $list[$i]['cost_center_kode'],
                    'cost_center_nama'      => $list[$i]['cost_center_nama'],
                    'storeloc'              => $list[$i]['storeloc'],
                    'storeloc_kode'         => $list[$i]['storeloc_kode'],
                    'storeloc_nama'         => $list[$i]['storeloc_nama'],
                    'coa'                   => $list[$i]['coa'],
                    'coa_kode'              => $list[$i]['coa_kode'],
                    'coa_nama'              => $list[$i]['coa_nama'],
                );
                if($DB->Insert(
                    $Table['gid'],
                    $FieldDetail
                )){
                    $return['status_detail'][$i]= array(
                        'index'     => $i,
                        'status'    => 1,
                    );

                    /**
                     * Update Outstanding MR
                     */
                    $MRDField = array(
                        'qty_outstanding'    => $list[$i]['qty_outstanding']
                    );
                    if($DB->Update(
                        $Table['detail'],
                        $MRDField,
                        "id = '" . $list[$i]['detail_id'] . "'"
                    )){
                        $return['update_mr_outstanding'][$i]= array(
                            'index'     => $i,
                            'status'    => 1,
                        );
                    }else{
                        $return['update_mr_outstanding'][$i] = array(
                            'index'     => $i,
                            'status'    => 0,
                            'error_msg' => "Failed Update Outstanding " . $list[$i]['nama']
                        );
                    }
                    //=> / END : Update Outstanding MR

                    /**
                     * Insert to Jurnal and Update Stock
                     */
                    $Jurnal = App::JurnalStock(array(
                        'tipe'          => 'credit',
                        'company'       => $company,
                        'dept'          => $dept,
                        'storeloc'      => $list[$i]['storeloc'],
                        'item'          => $list[$i]['id'],
                        'qty'           => $list[$i]['qty_gi'],
                        'price'         => $list[$i]['price'],
                        'kode'          => $kode,
                        'keterangan'    => CLEANHTML($remarks),
                        'tanggal'       => $tanggal_send
                    ));
                    //=> / END : Insert to Jurnal and Update Stock

                    if($enable_journal == 1 && $list[$i]['coa'] != 0 && $list[$i]['item_type']  == 1){
                        /**
                         * Insert to Jurnal Accounting
                         */
                        $Jurnal = App::JurnalPosting(array(
                            'trx_type'      => 2,
                            'tipe'          => 'debit',
                            'company'       => $company,
                            'source'        => $list[$i]['storeloc_kode'],
                            'target'        => $list[$i]['cost_center_kode'],
                            'item'          => $list[$i]['id'],
                            'cost_center'   => $list[$i]['cost_center'],
                            'qty'           => $list[$i]['qty_gi'],
                            'currency'      => 'IDR',
                            'rate'          => 1,
                            'coa'           => $list[$i]['coa'],
                            'value'         => ($list[$i]['qty_gi'] * $list[$i]['price']),
                            'kode'          => $kode,
                            'tanggal'       => $tanggal_send,
                            'keterangan'    => $list[$i]['remarks']
                        ));
                        //=> / END : Insert to Jurnal Posting and Update Balance

                        $Q_COA_Item = $DB->Query(
                            "item_grup_coa",
                            array(
                                'id',
                                'coa_persediaan',
                                'coa_beban'
                            ),
                            "
                            WHERE 
                                item_grup_id = '" . $list[$i]['grup'] . "'
                                AND company = ".$company."
                            "
                        );

                        $R_COA_Item = $DB->Row($Q_COA_Item);
                        if($R_COA_Item > 0){
                            $COA_Item = $DB->Result($Q_COA_Item);
                            if($COA_Item['coa_persediaan']){
                                $Jurnal = App::JurnalPosting(array(
                                    'trx_type'      => 2,
                                    'tipe'          => 'credit',
                                    'company'       => $company,
                                    'source'        => $list[$i]['storeloc_kode'],
                                    'target'        => $list[$i]['cost_center_kode'],
                                    'item'          => $list[$i]['id'],
                                    'cost_center'   => $list[$i]['cost_center'],
                                    'qty'           => $list[$i]['qty_gi'],
                                    'currency'      => 'IDR',
                                    'rate'          => 1,
                                    'coa'           => $COA_Item['coa_persediaan'],
                                    'value'         => ($list[$i]['qty_gi'] * $list[$i]['price']),
                                    'kode'          => $kode,
                                    'tanggal'       => $tanggal_send,
                                    'keterangan'    => $list[$i]['remarks']
                                ));
                            }
                        }
                    }

                }else{
                    $return['status_detail'][$i] = array(
                        'index'     => $i,
                        'status'    => 0,
                        'error_msg' => "Failed Insert Detail " . $list[$i]['nama']
                    );
                }
                //=> / END : Insert GI Detail

            }
        }
        //=> / END : Extract List

        /**
         * Set MR Finish
         */
        if($all_outstanding <= 0){
            $MRField = array(
                'finish'        => 1,
                'finish_date'   => date('Y-m-d H:i:s')
            );
            if($DB->Update(
                $Table['def'],
                $MRField,
                "id = '" . $mr_id . "'"
            )){
                $return['mr_finished'] = 1;
            }
        }
        //=> / END : Set MR Finish

    }

    $DB->Commit();
    $return['status'] = 1;

}
//=> / END : Insert Data

echo Core::ReturnData($return);
?>