<?php
$Modid = 44;

Perm::Check($Modid, 'add');

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
    'def'               => 'rgi',
    'detail'            => 'rgi_detail',
    'gi_detail'         => 'gi_detail',
    'mr'                => 'mr'
);

$list = json_decode($list_send, true);

/**
 * create code
 */
$Time = date('y') . "/";
$Time2 = romawi(date('n')) . "/";
$InitialCode = "RGI/" . strtoupper($company_abbr) . "-" . strtoupper($dept_abbr) . "/" . $Time . $Time2;
$InitialCodeCheck = "RGI/" . strtoupper($company_abbr) . "%/" . $Time;
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
//>> and create code

$Date = date("Y-m-d H:i:s");

$HistoryField = array(
    'table'        => $Table['def'],
    'clause'       => "WHERE kode = '" . $kode . "'",
    'action'		=> "add",
    'description'  => "Create new RGI from (" . $gi_kode . ")"
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
    'gi'            => $gi,
    'gi_kode'       => $gi_kode,
    'tanggal'       => $tanggal,
    'create_by'     => Core::GetState('id'),
    'create_date'   => $Date,
    'history'       => $History,
    'verified'      => 1,
    'status'        => 1,
);

$DB->ManualCommit();

if($DB->Insert(
    $Table['def'],
    $Field
)){

    /**
     * insert detail
     */
    $Q_Header = $DB->Query(
        $Table['def'],
        array('id'),
        "
            WHERE
                kode = '".$kode."' AND
                create_date = '".$Date."'
        "
    );
    $R_Header = $DB->Row($Q_Header);
    if($R_Header > 0){

        $Header = $DB->Result($Q_Header);

        for($i = 0; $i < sizeof($list); $i++){
            if(!empty($list[$i]['id']) && $list[$i]['qty_return'] != 0){

                $FieldDetail = array(
                    'header'        => $Header['id'],
                    'item'          => $list[$i]['id'],
                    'qty_issued'    => $list[$i]['qty_issued'],
                    'qty_return'    => $list[$i]['qty_return'],
                    'price'         => $list[$i]['price'],
                    'storeloc'      => $list[$i]['storeloc'],
                    'storeloc_kode' => $list[$i]['storeloc_kode'],
                    'storeloc_nama' => $list[$i]['storeloc_nama'],
                    'remarks'       => $list[$i]['remarks']
                );

                if($DB->Insert(
                    $Table['detail'],
                    $FieldDetail
                )){
                    /**
                     * UPDATE QTY RETURN IN TB GI
                     */
                    $GetLastReturn = $DB->Result($DB->Query(
                        $Table['gi_detail'],
                        array('qty_return'),
                        "
                            WHERE
                                header = '" . $gi . "' AND 
                                item = '" . $list[$i]['id'] . "'
                        "
                    ));
                    
                    $FieldReturn = array(
                        'qty_return'    => $list[$i]['qty_return'] + $GetLastReturn['qty_return']
                    );
                    if($DB->Update(
                        $Table['gi_detail'],
                        $FieldReturn,
                        "
                            header = '" . $gi . "' AND 
                            item = '" . $list[$i]['id'] . "'
                        "
                    )){
                        $DB->QueryPort("
                            UPDATE mr 
                            SET finish = 0 
                            WHERE
                                id IN ( SELECT mr FROM gi WHERE id = ".$gi." )
                        ");

                        $DB->QueryPort("
                            UPDATE mr_detail 
                            SET qty_outstanding = (qty_outstanding + ".$list[$i]['qty_return'].")
                            WHERE
                                header IN ( SELECT mr FROM gi WHERE id = ".$gi." )
                        ");
                        /**
                         * Insert to Jurnal and Update Stock
                         */
                        $Jurnal = App::JurnalStock(array(
                            'tipe'          => 'debit',
                            'company'       => $company,
                            'dept'          => $dept,
                            'storeloc'      => $list[$i]['storeloc'],
                            'item'          => $list[$i]['id'],
                            'qty'           => $list[$i]['qty_return'],
                            'price'         => $list[$i]['price'],
                            'kode'          => $kode,
                            'tanggal'       => $tanggal
                        ));
                        //=> / END : Insert to Jurnal and Update Stock

                        $return['detail'][$i]['jurnal'] = $Jurnal['msg'];

                        /**
                        * Select Item COA
                        */
                        if($enable_journal == 1 && $list[$i]['item_type'] == 1){

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
    
                                $GI_Detail = $DB->Result($DB->QueryPort("
                                    SELECT
                                        y.cost_center_kode,
                                        y.coa
                                    FROM
                                        gi x,
                                        gi_detail y 
                                    WHERE
                                        x.id = y.header
                                        AND x.id = ".$gi."
                                        AND y.item = ".$list[$i]['id']."
                                "));
    
                                if(!$list[$i]['cost_center']){
                                    $list[$i]['cost_center_kode'] = "X";
                                }
    
                                if($COA_Item['coa_persediaan']){
                                    $Jurnal = App::JurnalPosting(array(
                                        'trx_type'      => 4,
                                        'tipe'          => 'debit',
                                        'company'       => $company,
                                        'source'        => $list[$i]['storeloc_kode'],
                                        'target'        => $list[$i]['cost_center_kode'],
                                        'item'          => $list[$i]['id'],
                                        'cost_center'   => $list[$i]['cost_center'],
                                        'qty'           => $list[$i]['qty_return'],
                                        'currency'      => 'IDR',
                                        'rate'          => 1,
                                        'coa'           => $COA_Item['coa_persediaan'],
                                        'value'         => ($list[$i]['qty_return'] * $list[$i]['price']),
                                        'kode'          => $kode,
                                        'tanggal'       => $tanggal,
                                        'keterangan'    => $list[$i]['remarks']
                                    ));
                                    //=> / END : Insert to Jurnal Posting and Update Balance
    
                                    $return['detail'][$i]['jurnalPostingCredit'] = $Jurnal['msg'];
                                }
    
                                $Jurnal = App::JurnalPosting(array(
                                    'trx_type'      => 4,
                                    'tipe'          => 'credit',
                                    'company'       => $company,
                                    'source'        => $list[$i]['storeloc_kode'],
                                    'target'        => $list[$i]['cost_center_kode'],
                                    'cost_center'   => $list[$i]['cost_center'],
                                    'qty'           => $list[$i]['qty_return'],
                                    'item'          => $list[$i]['id'],
                                    'currency'      => 'IDR',
                                    'rate'          => 1,
                                    'coa'           => $GI_Detail['coa'],
                                    'value'         => ($list[$i]['qty_return'] * $list[$i]['price']),
                                    'kode'          => $kode,
                                    'tanggal'       => $tanggal,
                                    'keterangan'    => $list[$i]['remarks']
                                ));
                                //=> / END : Insert to Jurnal Posting and Update Balance
    
                                $return['detail'][$i]['jurnalPostingDebit'] = $Jurnal['msg'];
                            }
    
                        }
                    }

                    //>> END UPDATE QTY RETURN

                    $return['detail'][$i] = array(
                        'status'    => 1,
                        'data'      => array(
                            'header'    => $Header['id'],
                            'item'      => $list[$i]['item']
                        )
                    );
                }  
            }
        }
    }
    // >> end insert detail

    $DB->Commit();
    
    $return = array(
        'status'    => 1,
        'data'      => array(
            'header'    => $Header['id'],
            'kode'      => $kode,
            'tanggal'   => date("1, jS \of F Y", strtotime($tanggal))
        )
    );

}else{
    $return = array(
        'status'    => 0,
        'error_msg' => 'Failed to Save RGI'
    );
}

echo Core::ReturnData($return);
?>