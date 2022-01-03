<?php

$Modid = 180;
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

$list = json_decode($list, true);

$Table = array(
    'def'       => 'kontrak_progress',
    'detail'    => 'kontrak_progress_detail',
);

/**
 * Field
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
    'table'         => $Table['def'],
    'clause'        => "WHERE id = '" . $id . "'",
    'action'        => "edit",
    'description'   => "Edit Contract Progress"
);
$History = Core::History($HistoryField);
$Field = array(
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
    'update_by'         => Core::GetState('id'),
    'update_date'       => $Date,
    'history'           => $History
);

$DB->ManualCommit();

/*Update Data*/
if ($DB->Update(
    $Table['def'],
    $Field,
    "id = '" . $id . "'"
)) {

    /* Delete Detail Before Insert New*/
    $DB->Delete(
        $Table['detail'],
        "header = '" . $id . "'"
    );

    #Save Detail
    for ($i = 0; $i < sizeof($list); $i++) {
        if (!empty($list[$i]['coa'])) {
            $FieldsDetail = array(
                'header'            => $id,
                'header_detail_agreement' => $list[$i]['header_detail_agreement'],
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
                'progress'      => $list[$i]['progress']
            );

            if ($DB->Insert(
                $Table['detail'],
                $FieldsDetail
            )) {
                $return['status_detail'][$i] = array(
                    'index' => $i,
                    'status' => 1,
                    'field' => $FieldsDetail
                );
            }
        }
    }

    $DB->Commit();
    $return['status'] = 1;
} else {
    $return = array(
        'status'    => 0,
        'error_msg' => $GLOBALS['mysql']->error
    );
}
echo Core::ReturnData($return);

?>