<?php
$Modid = 179;
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
$InitialCode = "CI/" . strtoupper($company_abbr) . "/" . $Time;
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
    'invoice_ref'       => $invoice_ref,
    'invoice_tax'       => $invoice_tax,
    'tanggal'           => $tanggal_send,
    'tipe'              => 0,
    'payment_retention' => $payment_retention,
    'currency'          => $currency,
    'ppn'               => $ppn,
    'pph_code'          => $pph_code,
    'pph'               => $pph,
    'dp_percent'        => $dp_percent,
    'total_dp'          => $total_dp,
    'total_amount'      => $total_amount,
    'total_retention'   => $total_retention,
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
            if (!empty($list[$i]['id']) && $list[$i]['check'] == true) {

                $Fields = array(
                    'header'            => $Header['id'],
                    'detail_progress'   => $list[$i]['id'],
                    'tanggal'           => $list[$i]['tanggal'],
                    'coa'               => $list[$i]['coa'],
                    'coa_kode'          => $list[$i]['coa_kode'],
                    'coa_nama'          => $list[$i]['coa_nama'],
                    'kode'              => $list[$i]['kode'],
                    'progress'          => $list[$i]['progress'],
                    'uom'               => $list[$i]['uom'],
                    'kode'              => $list[$i]['kode'],
                    'retention'         => $list[$i]['retention'],
                    'amount'            => $list[$i]['amount'],
                    'remarks'           => $list[$i]['remarks'],
                    'status'            => 1,
                );

                if ($DB->Insert(
                    $Table['detail'],
                    $Fields
                )) {

                    $return['status_detail'][$i] = array(
                        'index' => $i,
                        'status' => 1
                    );

                    $FieldsDetail = array(
                        'invoice'       => 1,
                        'invoice_by'    => Core::GetState('id'),
                        'invoice_date'  => $Date
                    );
        
                    if ($DB->Update(
                        $Table['detail_progress'],
                        $FieldsDetail,
                        "id = '".$list[$i]['id']. "' "
                    )) {
                        $return['status_detail_progress'][$i] = array(
                            'index' => $i,
                            'status' => 1
                        );
                    }
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