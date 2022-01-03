<?php

$Modid = 117;
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
    'def'       => 'bp',
    'detail'    => 'bp_detail',
    'reff_a'    => 'invoice',
    'reff_b'    => 'sp3',
);

$list = json_decode($list_send, true);
$detail = json_decode($detail_send, true);
/**
 * Create Code
 */
$Time = date('y') . "/";
$Time2 = romawi(date('n')) . "/";
$InitialCode = "BP/" . strtoupper($company_abbr) . "/" . strtoupper($bank_kode) . "/" . $Time . $Time2;
$InitialCodeCheck = "BP/" . strtoupper($company_abbr) . "%/" . $Time;
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
    'description'   => "Create Bank Payment"
);
$History = Core::History($HistoryField);

$Field = array(
    'kode'                  => $kode,
    'tanggal'               => $tanggal_send,
    'company'               => $company,
    'company_abbr'          => $company_abbr,
    'company_nama'          => $company_nama,
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
    'create_by'             => Core::GetState('id'),
    'create_date'           => $Date,
    'history'               => $History,
    'status'                => 1
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
    $BP = $DB->Result($DB->Query(
        $Table['def'],
        array(
            'id'
        ),
        "
            WHERE
                kode = '" . $kode . "' AND
                create_date = '" . $Date . "'
        "
    ));

    /**
     * Insert Detail
     */
    for ($i = 0; $i < sizeof($list); $i++) {
        $FiledDetail = array(
            'header'    => $BP['id'],
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
            $FiledDetail
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

    // => End Insert Detail

    $DB->Commit();
    $return['status'] = 1;
} else {
    $return = array(
        'status'    => 0,
        'error_msg' => $GLOBALS['mysql']->error
    );
}
//>> End: Insert Data

echo Core::ReturnData($return);

?>