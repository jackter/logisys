<?php
$Modid = 181;
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
    'def'           => 'kontrak_agreement',
    'detail'        => 'kontrak_agreement_detail'
);

/**
 * Create Code
 */
$Time = date('y') . "/" . romawi(date('n')) . "/";
$InitialCode = "CA/" . strtoupper($company_abbr) . "/" . $Time;
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
    'description'   => "Add Contract Agreement"
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
    'req'               => $req,
    'req_kode'          => $req_kode,
    'spk_kode'          => $spk_kode,
    'tanggal'           => $tanggal_send,
    'start_date'        => $start_date_send,
    'end_date'          => $end_date_send,
    'dp'                => $dp,
    'dp_amount'         => $dp_amount_show,
    'dp_percent'        => $dp_percent,
    'payment'           => $payment,
    'payment_term'      => $payment_term,
    'payment_retention' => $payment_retention,
    'currency'          => $currency,
    'ppn'               => $ppn,
    'pph_code'          => $pph_code,
    'pph'               => $pph,
    'total_amount'      => $total_amount,
    'total_ppn'         => $total_ppn,
    'total_pph'         => $total_pph,
    'grand_total'       => $grand_total,
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

    $Q_Header = $DB->Query(
        $Table['def'],
        array('id'),
        "
            WHERE 
                kode = '" . $kode . "' AND
                create_date = '" . $Date . "'
        "
    );
    $R_Header = $DB->Row($Q_Header);

    if ($R_Header > 0) {

        $Header = $DB->Result($Q_Header);

        for ($i = 0; $i < sizeof($list); $i++) {
            if (!empty($list[$i]['coa'])) {

                $Fields = array(
                    'header'            => $Header['id'],
                    'coa'               => $list[$i]['coa'],
                    'coa_kode'          => $list[$i]['coa_kode'],
                    'coa_nama'          => $list[$i]['coa_nama'],
                    'volume'            => $list[$i]['volume'],
                    'rate'              => $list[$i]['rate'],
                    'uom'               => $list[$i]['uom'],
                    'amount'            => $list[$i]['amount'],
                    'tanggal'           => $list[$i]['tanggal_send'],
                    'remarks'           => $list[$i]['remarks']
                );

                if ($DB->Insert(
                    $Table['detail'],
                    $Fields
                )) {

                    $return['status_detail'][$i] = array(
                        'index' => $i,
                        'status' => 1
                    );
                }
            }
        }
    }

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