<?php

$Modid = 76;
Perm::Check($Modid, 'edit');

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
    'def'           => 'wb_kontrak'
);

/**
 * Field
 */
$Date = date("Y-m-d H:i:s");

// $HistoryField = array(
// 	'table'			=> $Table['def'],
// 	'clause'		=> "WHERE id = '" . $id . "'",
// 	'action'		=> "edit",
// 	'description'	=> "Edit Data Contract"
// );
// $History = Core::History($HistoryField);

$Field = array(
    'kode'          => $kode,
    'sup_cust'      => $supplier,
    'sup_cust_nama' => $supplier_nama,
    'product'       => $product,
    'product_kode'  => $product_kode,
    'product_nama'  => $product_nama,
    'item'          => $item,
    'item_kode'     => $item_kode,
    'item_nama'     => $item_nama,
    'item_satuan'   => $item_satuan,
    'tanggal'       => $tanggal_send,
    'qty'           => $qty,
    'update_by'     => Core::GetState('id'),
    'update_date'   => $Date
);
//=> / END : Field
$DB->ManualCommit();

/**
 * Update Data
 */
if ($DB->Update(
    $Table['def'],
    $Field,
    "id = '" . $id . "'",
    array(
        'wbclone'   => true
    )
)) {


    $DB->Update(
        'wb_state',
        array(
            'last_update' => date('Y-m-d H:i:s')
        ),
        "`table` = '" . $Table['def'] . "'"
    );
    
    $DB->Commit();
    $return['status'] = 1;
} else {
    $return = array(
        'status'    => 0,
        'error_msg' => $GLOBALS['mysql']->error
    );
}
//=> / END : Update Data

echo Core::ReturnData($return);
