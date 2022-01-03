<?php

$Modid = 180;
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
    'def'           => 'kontrak_progress',
    'detail'        => 'kontrak_progress_detail'
);

/**
 * Create Code
 */
$Time = date('y') . "/" . romawi(date('n')) . "/";
$InitialCode = "CP/" . strtoupper($company_abbr) . "/" . $Time;
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
    'description'   => "Add Contract Progress"
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
    'tanggal'           => $tanggal_send,
    'start_date'        => $start_date_send,
    'end_date'          => $end_date_send,
    'ppn'               => $ppn,
    'pph_code'          => $pph_code,
    'pph'               => $pph,
    'currency'          => $currency,
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
                    'header_detail_agreement' => $list[$i]['id'],
                    'coa'               => $list[$i]['coa'],
                    'coa_kode'          => $list[$i]['coa_kode'],
                    'coa_nama'          => $list[$i]['coa_nama'],
                    'volume'            => $list[$i]['volume'],
                    'rate'              => $list[$i]['rate'],
                    'uom'               => $list[$i]['uom'],
                    'amount'            => $list[$i]['amount'],
                    'remarks'           => $list[$i]['remarks'],
                    'keterangan'        => $list[$i]['keterangan'],
                    'current_progress'  => $list[$i]['current_progress'],
                    'progress'          => $list[$i]['progress'],
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