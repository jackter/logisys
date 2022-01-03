<?php

$Modid = 51;
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

$Table = array(
    'def'       => 'jv',
    'detail'    => 'jv_detail',
);

/**
 * Field
 */
$LIST = json_decode($list, true);

$Date = date("Y-m-d H:i:s");

$HistoryField = array(
    'table'         => $Table['def'],
    'clause'        => "WHERE id = '" . $id . "'",
    'action'        => "edit",
    'description'   => "Edit Journal Entry " . $kode
);
$History = Core::History($HistoryField);

$Field = array(
    'company'       => $company,
    'company_abbr'  => $company_abbr,
    'company_nama'  => $company_nama,
    'kode'          => $kode,
    'tanggal'       => $tanggal_send,
    'note'          => $note,
    'ref_type'      => $ref_type,
    'jv_type'       => 1,
    'total_credit'  => $creditTotal,
    'total_debit'   => $debitTotal,
    'update_by'     => Core::GetState('id'),
    'update_date'   => $Date,
    'history'       => $History
);
//=> / END : Field

$DB->ManualCommit();

/**
 * Update Data
 */
if ($DB->Update(
    $Table['def'],
    $Field,
    "
        id = '" . $id . "'
    "
)) {
    /**
     * Update Detail
     */
    for ($i = 0; $i < sizeof($LIST); $i++) {
        if (!empty($LIST[$i]['id'])) {

            $FieldDetail = array(
                'ref_cip'       => $LIST[$i]['ref_cip'],
                'ref_cip_kode'  => $LIST[$i]['ref_cip_kode'],
                'coa'           => $LIST[$i]['id'],
                'coa_kode'      => $LIST[$i]['kode'],
                'coa_nama'      => $LIST[$i]['nama'],
                'debit'         => $LIST[$i]['debit'],
                'credit'        => $LIST[$i]['credit'],
                'keterangan'    => $LIST[$i]['memo']
            );

            if ($DB->Update(
                $Table['detail'],
                $FieldDetail,
                "
                    id = '" . $LIST[$i]['id_detail'] . "'
                "
            )) {
                $return['status_detail'][$i] = array(
                    'index'     => $i,
                    'status'    => 1,
                );
            }
        }
    }

    $DB->Commit();
    $return['status'] = 1;
    // => End Update Detail
} else {
    $return = array(
        'status'    => 0,
        'error_msg' => $GLOBALS['mysql']->error
    );
}
//=> / END : Update Data

echo Core::ReturnData($return);

?>