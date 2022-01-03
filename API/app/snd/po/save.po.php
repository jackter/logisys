<?php
$Modid = 32;

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
    'prd'       => 'pr_detail'
);

$list = json_decode($list, true);

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
 * Field
 */
$Date = date("Y-m-d H:i:s");

if($company == 3){
    if($customs == "Yes"){
        $customs = 1;
    }
    else{
        $customs = 2;
    }
}

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
    'pq'            => $pq,
    'pq_kode'       => $pq_kode,
    'header_pq_supplier' => $header_pq_supplier,
    'supplier'      => $supplier,
    'supplier_kode' => $supplier_kode,
    'supplier_nama' => $supplier_nama,
    'storeloc'      => $storeloc,
    'storeloc_kode' => $storeloc_kode,
    'storeloc_nama' => $storeloc_nama,
    'tanggal'       => $tanggal,
    'dp'            => $dp,
    'os_dp'         => $os_dp,
    'payment_term'  => $payment_term,
    'weight_base'   => $weight_base,
    'po_contract'   => $po_contract,
    'delivery_plan' => $delivery_plan,
    'currency'      => $currency,
    'customs'       => $customs,
    'total'         => $total,
    'disc'          => $disc,
    'tax_base'      => $tax_base,
    'ppn'           => $ppn,
    'inclusive_ppn' => $inclusive_ppn,
    'pph_code'      => $pph_code,
    'pph'           => $pph,
    'note'          => $note,
    'other_cost'    => $other_cost,
    'ppbkb'         => $ppbkb,
    'grand_total'   => $grand_total,
    'create_by'     => Core::GetState('id'),
    'create_date'   => $Date,
    'history'       => $History,
    'status'        => 1
);
//=> / END : Field

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
        for($i = 0; $i < sizeof($list); $i++){
            if(!empty($list[$i]['item'])){

                $FieldDetail = array(
                    'header'        => $Header['id'],
                    'item'          => $list[$i]['item'],
                    'qty_po'        => $list[$i]['qty_po'],
                    'price'         => $list[$i]['price'],
                    'prc_cash'      => $list[$i]['prc_cash'],
                    'prc_credit'    => $list[$i]['prc_credit'],
                    'origin_quality'        => $list[$i]['origin_quality'],
                    'remarks'       => $list[$i]['remarks'],
                    'pph'           => $list[$i]['pph']
                );

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

                    $CurrentOutstanding = $DB->Result($DB->Query(
                        $Table['prd'],
                        array(
                            'qty_outstanding'
                        ),
                        "
                            WHERE
                                header = '" . $pr . "' AND 
                                item = '" . $list[$i]['item'] . "'
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
                            item = '" . $list[$i]['item'] . "'
                        "
                    )){
                        $return['detail'][$i]['update_outstanding'] = array(
                            'status' => 1,
                            'header' => $pr,
                            'item' => $list[$i]['id']
                        );
                    }
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
//=> / END : Insert Data

echo Core::ReturnData($return);
?>