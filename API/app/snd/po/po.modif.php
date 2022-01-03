<?php
$Modid = 32;

Perm::Check($Modid, 'po_modif');


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
 * Field
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
    'table'            => $Table['def'],
    'clause'        => "WHERE id = '" . $id . "'",
    'action'        => "edit",
    'description'    => "Modif PO"
);
$History = Core::History($HistoryField);

$Field = array(
    'dp'            => $dp,
    'inclusive_ppn' => $inclusive_ppn,
    'payment_term'  => $payment_term,
    'customs'       => $customs,
    'os_dp'         => $os_dp,
    'total'         => $total,
    'tax_base'      => $tax_base,
    'ppn'           => $ppn,
    'pph_code'      => $pph_code,
    'pph'           => $pph,
    'other_cost'    => $other_cost,
    'ppbkb'         => $ppbkb,
    'grand_total'   => $grand_total,
    'note'          => $note,
    'update_by'     => Core::GetState('id'),
    'update_date'   => $Date,
    'history'       => $History,
);
//=> / END : Field

$DB->ManualCommit();

/**
 * Insert Data
 */
if($DB->Update(
    $Table['def'],
    $Field,
    "id = '" . $id . "'"
)){

    for($i = 0; $i < sizeof($list); $i++){

        $PPh = 0;
        if($list[$i]['pph']){
            $PPh = 1;
        }

        $FieldDetail = array(
            'remarks'           => $list[$i]['remarks'],
            'origin_quality'    => $list[$i]['origin_quality'],
            'pph'               => $PPh,
            'price'             => $list[$i]['price']
        );

        # Update Detail
        if ($DB->Update(
            $Table['detail'],
            $FieldDetail,
            "id = '" . $list[$i]['detail_id'] . "'"
        )) {
            $return['status_detail'][$i] = array(
                'index' => $i,
                'status' => 1,
            );
        } else {
            $return['status_detail'][$i] = array(
                'index' => $i,
                'status' => 0,
                'error_msg' => $GLOBALS['mysql']->error
            );
        }

    }
    //=> / END : Insert Detail

    $DB->Commit();

    $return['status'] = 1;

}else{
    $return = array(
        'status'    => 0,
        'error_msg' => 'Failed to Save PO'
    );
}
//=> / END : Insert Data

echo Core::ReturnData($return);
?>