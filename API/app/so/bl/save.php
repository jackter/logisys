<?php

$Modid = 198;
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
    'bl'        => 'bl'
);

/**
 * Create Code
 */
$Time = date('y') . "/" . romawi(date('n')) . "/";
$InitialCode = "BL/" . strtoupper($company_abbr) . "/" . $Time;
$Len = 4;
$LastKode = $DB->Result($DB->Query(
    $Table['bl'],
    array('kode'),
    "
        WHERE
            kode LIKE '" . $InitialCode . "%' 
        ORDER BY 
            REPLACE(kode, '" . $InitialCode . "', '') DESC
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

$HistoryField = array(
    'table'            => $Table['bl'],
    'clause'        => "WHERE kode = '" . $kode . "'",
    'action'        => "add",
    'description'    => "Bill of Lading (" . $kode . ")"
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
 * Insert Data
 */
if ($DB->Insert(
    $Table['bl'],
    $Field
)) {
    $DB->Commit();
    $return['status'] = 1;
}
//=> / END : Insert Data

echo Core::ReturnData($return);

?>