<?php

$Modid = 188;
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
    'def'   => 'wb_kontrak_dev',
    'po'    => 'po'
);

$list_po = json_decode($list_po, true);

$List_PO = [];
$format_po = $COMMA = "";
foreach ($list_po as $Key => $Val) {
    $format_po .= $COMMA . $Val['id'];
    $COMMA = ",";
}

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
    'po'            => $format_po,
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
    "id = '" . $id . "'"
)) {

    $HistoryField = array(
        'table'         => $Table['po'],
        'clause'        => "WHERE id = '" . $po . "'",
        'action'        => "edit",
        'description'   => "Edit Data PO to Remove WB Contract"
    );
    $History = Core::History($HistoryField);

    $Field = array(
        'wb_kontrak'        => NULL,
        'wb_kontrak_kode'   => NULL,
        'update_by'         => Core::GetState('id'),
        'update_date'       => $Date,
        'history'           => $History
    );

    $DB->Update(
        $Table['po'],
        $Field,
        "wb_kontrak = '" . $id . "'"
    );

    $HistoryField = array(
        'table'         => $Table['po'],
        'clause'        => "WHERE id = '" . $po . "'",
        'action'        => "edit",
        'description'   => "Edit Data PO to WB Contract"
    );
    $History = Core::History($HistoryField);

    $Field = array(
        'wb_kontrak'        => $id,
        'wb_kontrak_kode'   => $kode,
        'update_by'         => Core::GetState('id'),
        'update_date'       => $Date,
        'history'           => $History
    );

    $DB->Update(
        $Table['po'],
        $Field,
        "id IN (" . $format_po . ")"
    );
    
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

?>