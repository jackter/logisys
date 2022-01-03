<?php

$Modid = 99;
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
    'bl'        => 'bl'
);

/**
 * Field
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
    'table'         => $Table['def'],
    'clause'        => "WHERE id = '" . $id . "'",
    'action'        => "edit",
    'description'   => "Edit Sales Order " . $kode
);
$History = Core::History($HistoryField);

$Field = array(
    'company'           => $company,
    'company_abbr'      => $company_abbr,
    'company_nama'      => $company_nama,
    'cust'              => $cust,
    'cust_nama'         => $cust_nama,
    'cust_kode'         => $cust_kode,
    'cust_abbr'         => $cust_abbr,
    'kode'              => $kode,
    'tanggal'           => $tanggal_send,
    'kontrak'           => $kontrak,
    'kontrak_kode'      => $kontrak_kode,
    'so'                => $so,
    'so_kode'           => $so_kode,
    'item'              => $item,
    'item_kode'         => $item_kode,
    'item_nama'         => $item_nama,
    'item_satuan'       => $item_satuan,
    'item_grup'         => $item_grup,
    'item_grup_nama'    => $item_grup_nama,
    'qty_so'            => $qty_so,
    'qty_shipping'      => $qty_shipping,
    'qty_bl'            => $qty_bl,
    'remarks'           => CLEANHTML($remarks),
    'create_by'         => Core::GetState('id'),
    'create_date'       => $Date,
    'history'           => $History
);
//=> / END : Field

$DB->ManualCommit();

/**
 * Update Data
 */
if ($DB->Update(
    $Table['bl'],
    $Field,
    "
        id = '" . $id . "'
    "
)) {
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