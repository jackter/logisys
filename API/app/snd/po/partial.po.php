<?php
$Modid = 32;

if(!Perm::Check2($Modid, 'partial_po')){
    $return = array(
        'status' => 0,
        'error_msg' => 'You does not have permissions'
    );
    echo Core::ReturnData($return);
    exit();
}

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
    'def'       => 'po',
    'detail'    => 'po_detail',
    'prd'       => 'pr_detail',
    'pq'        => 'pq'
);

$list = json_decode($list_send, true);

/**
 * Create Code
 */
$Time = date('y') . "/";
$Time2 = romawi(date('n')) . "/";
$InitialCode = "PO/" . strtoupper($company_abbr) . "-" . strtoupper($dept_abbr) . "/" . $Time . $Time2;
$InitialCodeCheck = "PO/" . strtoupper($company_abbr) . "%/" . $Time;
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
 * Definisi Kredit
 */
// if($disc_credit > 0){
//     $disc = $disc_credit;
// }else{
//     $disc = $disc_cash;
// }
//=> / END : Definisi Kredit

/**
 * Field
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
    'table'			=> $Table['def'],
    'clause'		=> "WHERE kode = '" . $kode . "'",
    'action'		=> "add",
    'description'	=> "Create new PO from (" . $pq_kode . ")"
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
    'mr'            => $mr,
    'mr_kode'       => $mr_kode,
    'pr'            => $pr,
    'pr_kode'       => $pr_kode,
    'supplier'      => $supplier,
    'supplier_kode' => $supplier_kode,
    'supplier_nama' => $supplier_nama,
    'storeloc'      => $storeloc,
    'storeloc_kode'    => $storeloc_kode,
    'storeloc_nama'    => $storeloc_nama,
    'tanggal'       => $tanggal_send,
    'dp'            => $dp,
    'os_dp'         => $os_dp,
    'payment_term'  => $payment_term,
    'delivery_plan' => $delivery_plan,
    'weight_base'   => $weight_base,
    'po_contract'   => $po_contract,
    'currency'      => $currency,
    'customs'       => $customs,
    'total'         => $total,
    'disc'          => $disc,
    'tax_base'      => $tax_base,
    'ppn'           => $ppn,
    'inclusive_ppn' => $inclusive_ppn,
    'pph_code'      => $pph_code,
    'pph'           => $pph,
    'other_cost'    => $other_cost,
    'ppbkb'         => $ppbkb,
    'grand_total'   => $grand_total,
    'note'          => $note,
    'create_by'     => Core::GetState('id'),
    'create_date'   => $Date,
    'history'       => $History,
    'status'        => 1,
);
//=> / END : Field

// $return['field'] = $Field;

// echo Core::ReturnData($return);
// exit();

$DB->ManualCommit();

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
        
        $Total = 0;
        $TotalPPh = 0;

        for($i = 0; $i < sizeof($list); $i++){
            if(!empty($list[$i]['id']) && $list[$i]['selected'] == 1){

                /**
                 * Get Price Type
                 */
                if($list[$i]['prc_cash'] > 0){
                    $Price = $list[$i]['prc_cash'];
                }else{
                    $Price = $list[$i]['prc_credit'];
                }
                $Total += $list[$i]['qty_po'] * $Price;
                //=> / END : Get Price Type

                /**
                 * Total PPh
                 */
                $PPh = 0;
                if($list[$i]['pph']){
                    $PPh = 1;
                    $TotalPPh += $list[$i]['qty_po'] * $Price;
                }
                //=> / END : Total PPh

                $FieldDetail = array(
                    'header'        => $Header['id'],
                    'item'          => $list[$i]['id'],
                    'qty_po'        => $list[$i]['qty_po'],
                    'price'         => $Price,
                    'prc_cash'      => $list[$i]['prc_cash'],
                    'prc_credit'    => $list[$i]['prc_credit'],
                    'origin_quality'        => $list[$i]['origin'],
                    'remarks'       => $list[$i]['remarks'],
                    'pph'           => $PPh
                );

                // $return['detail'][$i] = $FieldDetail;

                if($DB->Insert(
                    $Table['detail'],
                    $FieldDetail
                )){

                    $return['detail'][$i] = array(
                        'status'    => 1,
                        'data'      => array(
                            'header'    => $Header['id'],
                            'item'      => $list[$i]['item']
                        )
                    );

                    /**
                     * Update QTY Outstanding PR
                     */

                    $CurrentOutstanding = $DB->Result($DB->Query(
                        $Table['prd'],
                        array(
                            'qty_outstanding'
                        ),
                        "
                            WHERE
                                header = '" . $pr . "' AND 
                                item = '" . $list[$i]['id'] . "'
                        "
                    ));
                    $NewOutstanding = ($CurrentOutstanding['qty_outstanding'] - $list[$i]['qty_po']);
                    
                    // Clean < 0
                    if($NewOutstanding < 0){
                        $NewOutstanding = 0;
                    }

                    if($DB->Update(
                        $Table['prd'],
                        array(
                            'qty_outstanding' => $NewOutstanding
                        ),
                        "
                            header = '" . $pr . "' AND 
                            item = '" . $list[$i]['id'] . "'
                        "
                    )){
                        $return['detail'][$i]['update_outstanding'] = array(
                            'status' => 1,
                            'header' => $pr,
                            'item' => $list[$i]['id']
                        );
                    }
                    //=> / END : Update QTY Outstanding PR
                }else{
                    $return['detail'][$i] = array(
                        'status'    => 0,
                        'data'      => array(
                            'header'    => $Header['id'],
                            'item'      => $list[$i]['item']
                        ),
                        'error_msg' => "Failed Insert Detail PO"
                    );
                }

            }
        }

        /**
         * Update status PQ jika semua item sudah di buat PO partial
         */
        if($ready_finish && $ready_finish == true){
            $DB->Update(
                $Table['pq'],
                array(
                    'verified'  => 1,
                    'finish'    => 1,
                    'finish_date'=> $Date
                ),
                "
                    pr = '" . $pr . "'
                "
            );     
        }

        /**
         * Calculate Total
         */
        // $PPH = ($TotalPPh * $pph) / 100;
        // $PPN = ($Total * $ppn) / 100;
        // $GrandTotal = $Total + $PPN - $PPH;
        // $GrandTotal = $GrandTotal + $other_cost;

        // $UpdateField = array(
        //     'total' => $Total,
        //     'tax_base' => $Total,
        //     'grand_total' => $GrandTotal
        // );

        //=> UPDATE HEADER
        // $DB->Update(
        //     $Table['def'],
        //     $UpdateField,
        //     "id = '" . $Header['id'] . "'"
        // );
        //=> / END : Calculate Total

    }
    //=> / END : Insert Detail

    $DB->Commit();

    $return = array(
        'status'    => 1,
        'data'      => array(
            'id'        => $Header['id'],
            'kode'      => $kode,
            'tanggal'   => date("l, jS \of F Y", strtotime($tanggal))
        )
    );

}else{
    $return = array(
        'status'    => 0,
        'error_msg' => 'Failed to Save PO'
    );
}

echo Core::ReturnData($return);
?>