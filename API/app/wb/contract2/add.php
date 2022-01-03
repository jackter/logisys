<?php

$Modid = 188;
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

$list_po = json_decode($list_po, true);

$Table = array(
    'def'   => 'wb_kontrak_dev',
    'state' => 'wb_state',
    'po'    => 'po'
);

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
    'po'            => $format_po,
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
    $Field
)) {
    $Q_Data = $DB->Query(
        $Table['def'],
        array(
            'id',
            'kode'
        ),
        "
            WHERE
                kode = '" . $kode . "'
                AND product = '" . $product . "'
                AND item = '" . $item . "'
        "
    );

    $R_Data = $DB->Row($Q_Data);

    if ($R_Data > 0) {
        $Data = $DB->Result($Q_Data);

        $HistoryField = array(
            'table'         => $Table['po'],
            'clause'        => "WHERE id = '" . $po . "'",
            'action'        => "edit",
            'description'   => "Edit Data PO to WB Contract"
        );
        $History = Core::History($HistoryField);

        $Field = array(
            'wb_kontrak'        => $Data['id'],
            'wb_kontrak_kode'   => $Data['kode'],
            'update_by'         => Core::GetState('id'),
            'update_date'       => $Date,
            'history'           => $History
        );

        $DB->Update(
            $Table['po'],
            $Field,
            "id IN (" . $format_po . ")"
        );
    }

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