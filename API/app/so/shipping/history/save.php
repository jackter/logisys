<?php

$Modid = 69;
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
    'def'       => 'shipping'
);

/**
 * Create Code
 */
$Time = date('y') . "/" . romawi(date('n')) . "/";
$InitialCode = "SDO/" . strtoupper($company_abbr) . "/" . $Time;
$Len = 4;
$LastKode = $DB->Result($DB->Query(
    $Table['def'],
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
    'table'         => $Table['def'],
    'clause'        => "WHERE kode = '" . $kode . "'",
    'action'        => "add",
    'description'   => "Shipping (" . $kode . ")"
);
$History = Core::History($HistoryField);

$Field = array(
    'company'               => $company,
    'company_abbr'          => $company_abbr,
    'company_nama'          => $company_nama,
    'kode'                  => $kode,
    'tanggal'               => $tanggal_send,
    'kontrak'               => $kontrak,
    'kontrak_kode'          => $kontrak_kode,
    'kontrak_tanggal'       => $kontrak_tanggal,
    'so'                    => $so,
    'so_kode'               => $so_kode,
    'item'                  => $item,
    'item_kode'             => $item_kode,
    'item_nama'             => $item_nama,
    'item_satuan'           => $item_satuan,
    'qty_so'                => $qty_so,
    'qty_delivery'          => $qty_delivery,
    'storeloc'              => $storeloc,
    'storeloc_kode'         => $storeloc_kode,
    'storeloc_nama'         => $storeloc_nama,
    'cust'                  => $cust,
    'cust_nama'             => $cust_nama,
    'cust_kode'             => $cust_kode,
    'cust_abbr'             => $cust_abbr,
    'remarks'               => CLEANHTML($remarks),
    'create_by'             => Core::GetState('id'),
    'create_date'           => $Date,
    'history'               => $History
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

    $DB->Commit();

    $return['status'] = 1;
}
//=> / END : Insert Data

echo Core::ReturnData($return);

?>