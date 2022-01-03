<?php
$Modid = 66;

Perm::Check($Modid, 'edit');

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
    'def'       => 'stock_adjustment',
    'detail'    => 'stock_adjustment_detail',
    'sstock'    => 'storeloc_stock'
);

/**
 * Field
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
	'table'			=> $Table['def'],
	'clause'		=> "WHERE id = '" . $id . "'",
	'action'		=> "edit",
	'description'	=> "Edit MT"
);
$History = Core::History($HistoryField);
$Field = array(
    'adj_qty'       => $adj_qty,
    'adj_value'     => $adj_value,
    'remarks'       => $remarks,
    'update_by'		=> Core::GetState('id'),
	'update_date'	=> $Date,
	'history'		=> $History
);
//=> / END : Field

$DB->ManualCommit();


/**
 * Update Data
 */
if($DB->Update(
    $Table['def'],
    $Field,
    "id = '" . $id . "' AND verified = 0"
)){

    if($DB->Delete(
        $Table['detail'],
        "header = '" . $id . "'"
    )){

        for($i = 0; $i < sizeof($list); $i++){

            $FieldDetail = array(
                'header'    => $id,
                'item'      => $list[$i]['id'],
                'debit'     => $list[$i]['debit'],
                'credit'    => $list[$i]['credit'],
                'price'     => $list[$i]['price']
            );
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

        $DB->Commit();
        $return['status'] = 1;

    }

    // if($DB->Delete(
    //     $Table['detail'],
    //     "header = '" . $id . "'"
    // )){

    //     for($i = 0; $i < sizeof($list); $i++){

    //         if(
    //             !empty($list[$i]['id']) && 
    //             (
    //                 $list[$i]['selisih'] != 0 || 
    //                 $list[$i]['selisih_val'] != 0
    //             )
    //         ){

    //             $FieldDetail = array(
    //                 'header'    => $id,
    //                 'item'      => $list[$i]['id'],
    //                 'price'     => $list[$i]['price'],  //=> Harga Current

    //                 'price_new'         => $list[$i]['price_new'],
    //                 'price_stock'   => $list[$i]['price_new_stock'],
    //             );
    //             $FieldDetail['stock'] = $list[$i]['stock'];
    //             if($adj_qty == 1){
    //                 $FieldDetail['actual'] = $list[$i]['qty'];
    //                 $FieldDetail['selisih'] = $list[$i]['selisih'];
    //                 $FieldDetail['jurnal'] = $list[$i]['jurnal'];
    //                 $FieldDetail['qty_jurnal'] = $list[$i]['qty_jurnal'];
    //             }
    //             if($adj_value == 1){
    //                 $FieldDetail['current_val'] = $list[$i]['current_val'];
    //                 $FieldDetail['val'] = $list[$i]['val'];
    //                 $FieldDetail['selisih_val'] = $list[$i]['selisih_val'];
    //                 $FieldDetail['jurnal_acc'] = $list[$i]['jurnal_acc'];
    //                 $FieldDetail['val_jurnal_acc'] = $list[$i]['val_jurnal_acc'];
    //             }

    //             $FieldDetail['coa'] = $list[$i]['coa'];
    //             $FieldDetail['coa_kode'] = $list[$i]['coa_kode'];
    //             $FieldDetail['coa_nama'] = $list[$i]['coa_nama'];

    //             if($DB->Insert(
    //                 $Table['detail'],
    //                 $FieldDetail
    //             )){
    //                 $return['status_detail'][$i]= array(
    //                     'index'     => $i,
    //                     'status'    => 1,
    //                 );
    //             }else{
    //                 $return['status_detail'][$i] = array(
    //                     'index'     => $i,
    //                     'status'    => 0,
    //                     'error_msg' => $GLOBALS['mysql']->error
    //                 );
    //             }


    //         }
    //     }

    //     $DB->Commit();
    //     $return['status'] = 1;

    // }

}
//=> / END : Update Data

echo Core::ReturnData($return);
?>