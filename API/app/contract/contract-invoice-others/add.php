<?php
$Modid = 178;
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

$list = json_decode($list, true);

$Table = array(
    'def'           => 'kontrak_invoice',
    'detail'        => 'kontrak_invoice_detail',
    'detail_progress'    => 'kontrak_progress_detail'
);

/**
 * Create Code
 */
$Time = date('y') . "/" . romawi(date('n')) . "/";
if($other_invoice_type == 1){
    $InitialCode = "CI-DP/" . strtoupper($company_abbr) . "/" . $Time;
}
else{
    $InitialCode = "CI-RET/" . strtoupper($company_abbr) . "/" . $Time;
    $dp_total = $grand_total;
}
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
$LastKode = (int) substr($LastKode['kode'], -$Len) + 1;
$LastKode = str_pad($LastKode, $Len, 0, STR_PAD_LEFT);

$kode = $InitialCode . $LastKode;
//=> END : Create Code

$Date = date('Y-m-d H:i:s');

$HistoryField = array(
    'table'         => $Table['def'],
    'action'        => "add",
    'description'   => "Add Contract Invoice"
);
$History = Core::History($HistoryField);

$Fields = array(
    'kode'              => $kode,
    'company'           => $company,
    'company_abbr'      => $company_abbr,
    'company_nama'      => $company_nama,
    'kontraktor'        => $kontraktor,
    'kontraktor_kode'   => $kontraktor_kode,
    'kontraktor_nama'   => $kontraktor_nama,
    'agreement'         => $agreement,
    'agreement_kode'    => $agreement_kode,
    'invoice'           => $invoice,
    'invoice_kode'      => $invoice_kode,
    'invoice_ref'       => $invoice_ref,
    'invoice_tax'       => $invoice_tax,
    'tanggal'           => $tanggal_send,
    'tipe'              => $other_invoice_type,
    'payment_retention' => $payment_retention,
    'currency'          => $currency,
    'ppn'               => $ppn,
    'pph_code'          => $pph_code,
    'pph'               => $pph,
    'dp_percent'        => $dp_percent,
    'total_amount'      => $total_amount,
    'total_ppn'         => $total_ppn,
    'total_pph'         => $total_pph,
    'grand_total'       => $dp_total,
    'remarks'           => $remarks,
    'create_by'         => Core::GetState('id'),
    'create_date'       => $Date,
    'history'           => $History,
    'status'            => 1
);

$DB->ManualCommit();

if ($DB->Insert(
    $Table['def'],
    $Fields
)) {

    $DB->Commit();
    $return['status'] = 1;

} else {
    $return = array(
        'status'    => 0,
        'error_msg' => 'Gagal Menyimpan Data'
    );
}
echo Core::ReturnData($return);

?>