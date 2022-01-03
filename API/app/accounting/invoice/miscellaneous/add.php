<?php
$Modid = 202;
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
    'def'       => 'invoice',
    'expense'   => 'invoice_expense'
);

/**
 * Create Code
 */
$var = "";
if ($tipe_pihak_ketiga == 1) {
    $var = "INV-MS/";
} elseif ($tipe_pihak_ketiga == 2) {
    $var = "INV-MC/";
} elseif ($tipe_pihak_ketiga == 4) {
    $var = "INV-MT/";
}

$Time = date('y') . "/";
$Time2 = romawi(date('n')) . "/";
$InitialCode = $var . strtoupper($company_abbr) . "/" . $Time . $Time2;
$InitialCodeCheck = $var . strtoupper($company_abbr) . "/" . $Time;
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
    'description'   => "Create New Invoice Miscellaneous (" . $kode . ")"
);
$History = Core::History($HistoryField);

$list = json_decode($list_send, true);

$Field = array(
    'kode'              => $kode,
    'tipe'              => 4,
    'company'           => $company,
    'company_abbr'      => $company_abbr,
    'company_nama'      => $company_nama,
    'tipe_pihak_ketiga' => $tipe_pihak_ketiga,
    'pihak_ketiga'      => $pihak_ketiga,
    'pihak_ketiga_kode' => $pihak_ketiga_kode,
    'pihak_ketiga_nama' => $pihak_ketiga_nama,
    'inv_tgl'       => $tanggal_inv_send,
    'ref_kode'          => $ref_kode,
    'ref_tgl'           => $ref_tgl_send,
    'pajak_no'          => $pajak_no,
    'pajak_tgl'         => $pajak_tgl_send,
    'tgl_jatuh_tempo' => $tgl_jatuh_tempo_send,
    'currency'          => $currency,
    'jurnal_post'       => $jurnal_post,
    'amount'            => $total_amount,
    'note'              => $note,
    'create_by'         => Core::GetState('id'),
    'create_date'       => $Date,
    'history'           => $History,
    'status'            => 1
);

$DB->ManualCommit();

if ($DB->Insert(
    $Table['def'],
    $Field
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
            if (!empty($list[$i]['coa']) && $list[$i]['amount'] != 0) {
                $FieldDetail = array(
                    'header'        => $Header['id'],
                    'coa'           => $list[$i]['coa'],
                    'coa_nama'      => $list[$i]['coa_nama'],
                    'coa_kode'      => $list[$i]['coa_kode'],
                    'jumlah'        => $list[$i]['amount'],
                    'keterangan'    => $list[$i]['keterangan']
                );

                $DB->Insert(
                    $Table['expense'],
                    $FieldDetail
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
//=> / END : Field

echo Core::ReturnData($return);

?>