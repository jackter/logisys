<?php

$Modid = 183;
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

$List = json_decode($list, true);

$Table = array(
    'def'       => 'kontrak_request',
    'detail'    => 'kontrak_request_detail',
);

/**
 * Field
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
    'table'            => $Table['def'],
    'clause'        => "WHERE id = '" . $id . "'",
    'action'        => "edit",
    'description'    => "Edit Contract Request"
);
$History = Core::History($HistoryField);
$Field = array(
    'tanggal'           => $tanggal_send,
    'company'           => $company,
    'company_abbr'      => $company_abbr,
    'company_nama'      => $company_nama,
    'duration'          => $duration,
    'work'              => $work,
    'work_nama'         => $work_nama,
    'work_code'         => $work_code,
    'cip'               => $cip,
    'cip_kode'          => $cip_kode,
    'kontrak_tipe'      => $kontrak_tipe,
    'grand_total'       => $grand_total,
    'currency'          => $currency,
    'start_date'        => $start_date_send,
    'end_date'          => $end_date_send,
    'update_by'     => Core::GetState('id'),
    'update_date'   => $Date,
    'history'       => $History
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
    for ($i = 0; $i < sizeof($List); $i++) {
        if (!empty($List[$i]['coa'])) {
            $FieldsDetail = array(
                'header'            => $id,
                'coa'               => $List[$i]['coa'],
                'coa_kode'          => $List[$i]['coa_kode'],
                'coa_nama'          => $List[$i]['coa_nama'],
                'keterangan'        => $List[$i]['keterangan'],
                'volume'            => $List[$i]['volume'],
                'uom'               => $List[$i]['uom'],
                'est_rate'          => $List[$i]['est_rate'],
                'total'             => $List[$i]['total']
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