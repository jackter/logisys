<?php

$Modid = 117;
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
    'def'       => 'bp',
    'detail'    => 'bp_detail',
    'reff_a'    => 'invoice',
    'reff_b'    => 'sp3',
);

/**
 * Field
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
    'table'         => $Table['def'],
    'clause'        => "WHERE id = '" . $id . "'",
    'action'        => "edit",
    'description'   => "Edit Bank Payment " . $kode
);
$History = Core::History($HistoryField);

$list = json_decode($list_send, true);

$Field = array(
    'tanggal'               => $tanggal_send,
    'company_bank'          => $company_bank,
    'bank'                  => $bank,
    'bank_kode'             => $bank_kode,
    'bank_nama'             => $bank_nama,
    'bank_coa'              => $bank_coa,
    'bank_coa_kode'         => $bank_coa_kode,
    'bank_coa_nama'         => $bank_coa_nama,
    'no_rekening'           => $no_rekening,
    'buku_cek_ket'          => $buku_cek_ket,
    'currency'              => $currency,
    'rate'                  => $rate,
    'reff_type'             => $reff_type,
    'subjek'                => $subjek,
    'subjek_nama'           => $subjek_nama,
    'tipe_pihak_ketiga'     => $tipe_pihak_ketiga,
    'pihak_ketiga'          => $pihak_ketiga,
    'pihak_ketiga_kode'     => $pihak_ketiga_kode,
    'pihak_ketiga_nama'     => $pihak_ketiga_nama,
    'supplier'              => $supplier,
    'supplier_kode'         => $supplier_kode,
    'supplier_nama'         => $supplier_nama,
    'penerima_nama_bank'    => $penerima_nama_bank,
    'penerima_bank_rek'     => $penerima_bank_rek,
    'penerima_bank_nama'    => strtoupper($penerima_bank_nama),
    'total'                 => $total,
    'remarks'               => $remarks,
    'update_by'             => Core::GetState('id'),
    'update_date'           => $Date,
    'history'               => $History
);
//=> / END : Field

$DB->ManualCommit();

$BP = $DB->Result($DB->Query(
    $Table['def'],
    array(
        'reff_type'
    ),
    "
        WHERE
            id = '" . $id . "'
    "
));

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

    $Q_Detail = $DB->Query(
        $Table['detail'],
        array(
            'reff_id',
            'reff_kode',
            'total'
        ),
        "
            WHERE
                header = '" . $id . "'
        "
    );

    $R_Detail = $DB->Row($Q_Detail);
    if ($R_Detail > 0) {
        $i = 0;
        while ($Detail = $DB->Result($Q_Detail)) {
            if($reff_type == 5 && $Detail['reff_id'] > 0){
                /**
                 * Update total in invoice
                 */
                $DB->QueryPort("
                    UPDATE " . $Table['reff_b'] . " SET payment_amount = payment_amount - " . $list[$i]['total'] . " WHERE id = " . $list[$i]['reff_id'] . "
                ");
                // => End : Update total in invoice
            }
        }
    }

    if ($DB->Delete(
        $Table['detail'],
        "
            header = '" . $id . "'
        "
    )) {
        for ($i = 0; $i < sizeof($list); $i++) {
            $FieldDetail = array(
                'header'    => $id,
                'reff_id'   => $list[$i]['reff_id'],
                'reff_kode' => $list[$i]['reff_kode'],
                'coa'       => $list[$i]['coa'],
                'coa_kode'  => $list[$i]['coa_kode'],
                'coa_nama'  => $list[$i]['coa_nama'],
                'uraian'    => $list[$i]['uraian'],
                'total'     => $list[$i]['total']
            );
    
            if ($DB->Insert(
                $Table['detail'],
                $FieldDetail
            )) {
                if($reff_type == 5 && $list[$i]['reff_id'] > 0){
                    /**
                     * Update total in invoice
                     */
                    $DB->QueryPort("
                        UPDATE " . $Table['reff_b'] . " SET payment_amount = payment_amount + " . $list[$i]['total'] . " WHERE id = " . $list[$i]['reff_id'] . "
                    ");
                    // => End : Update total in invoice
                }
                $return['status_detail'][$i] = array(
                    'index'     => $i,
                    'status'    => 1,
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
//=> / END : Update Data

echo Core::ReturnData($return);

?>