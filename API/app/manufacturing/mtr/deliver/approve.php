<?php

$Modid = 64;

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

if ($receive_process == 1) {
    Perm::Check($Modid, 'approve_rcv');
} else {
    Perm::Check($Modid, 'approve_deliver');
}

if (isset($material)) {
    $material = json_decode($material, true);
} else {
    $material = array();
}

if (isset($list)) {
    $list = json_decode($list, true);
} else {
    $list = array();
}

$Table = array(
    'def'       => 'prd_tf_deliver'
);

/**
 * Update Verify
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
    'table'         => $Table['def'],
    'clause'        => "WHERE id = '" . $id . "'",
    'action'        => "approve",
    'description'   => "Approve DTF " . $kode
);
$History = Core::History($HistoryField);

$Field = array(
    'update_by'      => Core::GetState('id'),
    'update_date'    => $Date,
    'history'        => $History
);
if ($receive_process == 1) {
    $Field['approved_rcv'] = 1;
    $Field['approved_by_rcv'] = Core::GetState('id');
    $Field['approved_date_rcv'] = $Date;
} else {
    $Field['approved'] = 1;
    $Field['approved_by'] = Core::GetState('id');
    $Field['approved_date'] = $Date;
}
$DB->ManualCommit();

if ($DB->Update(
    $Table['def'],
    $Field,
    "id = '" . $id . "'"
)) {

    /**
     * Material
     */
    for ($i = 0; $i < sizeof($material); $i++) {

        if ($receive_process != 1) { // SEND PROCESS

            if ($material[$i]['qty'] > 0) {

                if ($DB->Update(
                    $Table['def'] . '_detail',
                    array(
                        'price' => $material[$i]['price']
                    ),
                    "id = '" . $material[$i]['id_detail'] . "'"
                )) {

                    $FieldJurnal = array(
                        'tipe'      => 'credit',
                        'company'   => $company,
                        'dept'      => $dept,
                        'storeloc'  => $material[$i]['storeloc'],
                        'item'      => $material[$i]['id'],
                        'qty'       => $material[$i]['qty'],
                        'price'     => $material[$i]['price'],
                        'kode'      => $kode,
                        'tanggal'   => $tanggal,
                        'keterangan'    => 'Approve Material ' . $kode
                    );
                    App::JurnalStock($FieldJurnal);

                    /**
                     * Select Item COA
                     */
                    // $Q_COA_Item = $DB->Query(
                    //     "item_coa",
                    //     array(
                    //         'id',
                    //         'item_type',
                    //         'coa_persediaan',
                    //         'coa_penjualan',
                    //         'coa_disc_penjualan',
                    //         'coa_retur_penjualan',
                    //         'coa_retur_pembelian',
                    //         'coa_hpp',
                    //         'coa_accrued',
                    //         'coa_beban'
                    //     ),
                    //     "
                    //     WHERE 
                    //         item_id = '" . $material[$i]['id'] . "'
                    //         AND company = " . $company . "
                    //     "
                    // );
                    // $R_COA_Item = $DB->Row($Q_COA_Item);
                    // if ($R_COA_Item > 0) {
                    //     $COA_Item = $DB->Result($Q_COA_Item);

                    //     if (!$material[$i]['cost_center_kode']) {
                    //         $material[$i]['cost_center_kode'] = "X";
                    //     }

                    //     $Jurnal = App::JurnalPosting(array(
                    //         'trx_type'      => 2,
                    //         'tipe'          => 'debit',
                    //         'company'       => $material[$i]['company'],
                    //         'source'        => $material[$i]['storeloc_kode'],
                    //         'target'        => $material[$i]['cost_center_kode'],
                    //         'target_2'      => $material[$i]['id'],
                    //         'currency'      => 'IDR',
                    //         'rate'          => 1,
                    //         'coa'           => $material[$i]['coa'],
                    //         'value'         => ($material[$i]['qty'] * $material[$i]['price']),
                    //         'kode'          => $kode,
                    //         'tanggal'       => $material[$i]['tanggal'],
                    //         'keterangan'    => $material[$i]['remarks']
                    //     ));

                    // }
                }
            }
        } else { // RECEIVE PROCESS

            if ($material[$i]['qty_receive'] > 0) {

                $FieldJurnal = array(
                    'tipe'      => 'debit',
                    'company'   => $company,
                    'dept'      => $dept,
                    'storeloc'  => $storeloc,
                    'item'      => $material[$i]['id'],
                    'qty'       => $material[$i]['qty_receive'],
                    'price'     => $material[$i]['price'],
                    'kode'      => $kode,
                    'tanggal'   => $tanggal,
                    'keterangan'    => 'Receive Material ' . $kode
                );
                App::JurnalStock($FieldJurnal);
            }
        }
    }
    //=> / END : Material

    /**
     * List
     */
    for ($i = 0; $i < sizeof($list); $i++) {

        if ($receive_process != 1) { // SEND PROCESS

            if ($list[$i]['qty'] > 0) {

                if ($DB->Update(
                    $Table['def'] . '_detail',
                    array(
                        'price' => $list[$i]['price']
                    ),
                    "id = '" . $list[$i]['id_detail'] . "'"
                )) {

                    $FieldJurnal = array(
                        'tipe'      => 'credit',
                        'company'   => $company,
                        'dept'      => $dept,
                        'storeloc'  => $list[$i]['storeloc'],
                        'item'      => $list[$i]['id'],
                        'qty'       => $list[$i]['qty'],
                        'price'     => $list[$i]['price'],
                        'kode'      => $kode,
                        'tanggal'   => $tanggal,
                        'keterangan'    => 'Approve Other Materials ' . $kode
                    );
                    App::JurnalStock($FieldJurnal);
                }
            }
        } else { // RECEIVE PROCESS

            if ($list[$i]['qty_receive'] > 0) {

                $FieldJurnal = array(
                    'tipe'      => 'debit',
                    'company'   => $company,
                    'dept'      => $dept,
                    'storeloc'  => $storeloc,
                    'item'      => $list[$i]['id'],
                    'qty'       => $list[$i]['qty'],
                    'price'     => $list[$i]['price'],
                    'kode'      => $kode,
                    'tanggal'   => $tanggal,
                    'keterangan'    => 'Receive Other Materials ' . $kode
                );
                App::JurnalStock($FieldJurnal);
            }
        }
    }
    //=> / END : List
    $DB->Commit();

    $return['status'] = 1;
} else {
    $return = array(
        'status'    => 0,
        'error_msg' => $GLOBALS['mysql']->error
    );
}
//=> / END: Update Verify

echo Core::ReturnData($return);

?>