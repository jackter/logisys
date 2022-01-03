<?php

$Modid = 76;
Perm::Check($Modid, 'add');

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
    'def'   => 'wb_kontrak',
    'state' => 'wb_state'
);

/**
 * Field
 */
$Date = date("Y-m-d H:i:s");

// $HistoryField = array(
// 	'table'			=> $Table['def'],
// 	'clause'		=> "WHERE id = '" . $id . "'",
// 	'action'		=> "add",
// 	'description'	=> "Create Contract"
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
    'create_by'     => Core::GetState('id'),
    'create_date'   => $Date
);
//=> / END : Field
$DB->ManualCommit();

/**
 * Insert Data
 */
if ($DB->Insert(
    $Table['def'],
    $Field,
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
//>> End: Insert Data

echo Core::ReturnData($return);

?>