<?php

$Modid = 73;
Perm::Check($Modid, 'add');

//=> Default Statement
$return = [];
$RPL    = "";
$SENT    = Core::Extract($_POST, $RPL);

//=> Extract Array
if (isset($SENT)) {
    foreach ($SENT as $KEY => $VAL) {
        $$KEY = $VAL;
    }
}

$Table = array(
    'def'       => 'sales_invoice',
    'sc'        => 'kontrak'
);

/**
 * Create Code
 */
$Time = date('y') . "/";
$Time2 = romawi(date('n')) . "/";
$InitialCode = "SINV-DP/" . strtoupper($company_abbr) . "/" . $Time . $Time2;
$InitialCodeCheck = "SINV-DP/" . strtoupper($company_abbr) . "/" . $Time;

$Len = 4;
$LastKode = $DB->Result($DB->Query(
    $Table['def'],
    array('kode'),
    "
        WHERE
            kode LIKE '" . $InitialCodeCheck . "%' 
        ORDER BY 
            SUBSTR(kode, -$Len, $Len) DESC  
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
    'clause'        => "WHERE id = '" . $id . "'",
    'action'        => "add",
    'description'   => "Create New Sales Invoice Others (" . $kode . ")"
);
$History = Core::History($HistoryField);

$Field = array(
    'company'       => $company,
    'company_abbr'  => $company_abbr,
    'company_nama'  => $company_nama,
    'sc'            => $sc,
    'sc_kode'       => $sc_kode,
    'kode'          => $kode,
    'tipe'          => 1,
    'cust'          => $cust,
    'cust_kode'     => $cust_kode,
    'cust_nama'     => $cust_nama,
    'cust_abbr'     => $cust_nama,
    'inv_tgl'       => $inv_tgl_send,
    'currency'      => $currency,
    'ppn_amount'    => $ppn_amount,
    'amount'        => $grand_total,
    'note'          => $note,
    'create_by'     => Core::GetState('id'),
    'create_date'   => $Date,
    'history'       => $History,
    'status'        => 1
);

$DB->ManualCommit();

if ($DB->Insert(
    $Table['def'],
    $Field
)) {
    $Field = array(
        'dp_invoice_status' => 1
    );
    $DB->Update(
        $Table['sc'],
        $Field,
        "
            id = '" . $sc . "'
        "
    );

    $DB->Commit();
    $return['status'] = 1;
} else {
    $return = array(
        'status'    => 0,
        'error_msg' => $GLOBALS['mysql']->error
    );
}
//=> / END : Field

echo Core::ReturnData($return);

?>