<?php

$Modid = 189;
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
    'def'       => 'netto_summary'
);

/**
 * Create Code
 */
// $Time = date('y') . "/" . romawi(date('n')) . "/" . date('d') . "/" . str_pad($storeloc, 3, 0, STR_PAD_LEFT) . "/";
// $InitialCode = "ADJ/" . strtoupper($storeloc_kode) . "/" . $Time;
// $Len = 2;
// $LastKode = $DB->Result($DB->Query(
//     $Table['def'],
//     array('kode'),
//     "
//         WHERE
//             kode LIKE '" . $InitialCode . "%' 
//         ORDER BY 
//             REPLACE(kode, '" . $InitialCode . "', '') DESC
//     "
// ));
// $LastKode = (int)substr($LastKode['kode'], -$Len) + 1;
// $LastKode = str_pad($LastKode, $Len, 0, STR_PAD_LEFT);

// $kode = $InitialCode . $LastKode;
//=> / END : Create Code

/**
 * Field
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
    'table'            => $Table['def'],
    'clause'        => "WHERE create_date = '" . $Date . "'",
    'action'        => "add",
    'description'    => "Create New Netto Summary"
);
$History = Core::History($HistoryField);

$Field = array(
    'company'       => $company,
    'company_abbr'  => $company_abbr,
    'company_nama'  => $company_nama,
    'tanggal'       => $tanggal_send,
    'tiket_start'   => $tiket_start,
    'tiket_start_kode' => $tiket_start_kode,
    'tiket_end'     => $tiket_end,
    'tiket_end_kode' => $tiket_end_kode,
    'item'          => $item,
    'item_kode'     => $item_kode,
    'item_nama'     => $item_nama,
    'item_satuan'   => $item_satuan,
    'total_netto'   => $total_netto,
    'create_by'        => Core::GetState('id'),
    'create_date'    => $Date,
    'history'        => $History
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
} else {
    $return = array(
        'status'    => 0,
        'error_msg' => $GLOBALS['mysql']->error
    );
}
//=> / END : Insert Data

echo Core::ReturnData($return);

?>