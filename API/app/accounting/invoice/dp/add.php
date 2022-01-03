<?php

$Modid = 46;
Perm::Check($Modid, 'add');

//=> Default Statement
$return = [];
$RPL    = "";
$SENT    = Core::Extract($_POST, $RPL);

//=> Extract Array
if (isset($SENT)) {
    foreach ($SENT as $KEY => $VAL) {
        $$KEY = $VAL;
    }
}

$Table = array(
    'def'       => 'invoice',
    'detail'    => 'invoice_detail',
    'expense'   => 'invoice_expense',
    'po'        => 'po',
    'po_detail' => 'po_detail'
);

/**
 * Create Code
 */
$Time = date('y') . "/";
$Time2 = romawi(date('n')) . "/";
if ($other_invoice_type == 0) {
    $InitialCode = "INV-DP/" . strtoupper($company_abbr) . "-" . strtoupper($dept_abbr) . "/" . $Time . $Time2;
    $InitialCodeCheck = "INV-DP/" . strtoupper($company_abbr) . "%/" . $Time;
} elseif ($other_invoice_type == 1) {
    $InitialCode = "INV-SB/" . strtoupper($company_abbr) . "-" . strtoupper($dept_abbr) . "/" . $Time . $Time2;
    $InitialCodeCheck = "INV-SB/" . strtoupper($company_abbr) . "%/" . $Time;
}

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
    'description'   => "Create New Invoice (" . $kode . ")"
);
$History = Core::History($HistoryField);

$list = json_decode($list_send, true);

$Field = array(
    'company'       => $company,
    'company_abbr'  => $company_abbr,
    'company_nama'  => $company_nama,
    'dept'          => $dept,
    'dept_abbr'     => $dept_abbr,
    'dept_nama'     => $dept_nama,
    'supplier'      => $supplier,
    'supplier_kode' => $supplier_kode,
    'supplier_nama' => $supplier_nama,
    'kode'          => $kode,
    'po'            => $po,
    'po_kode'       => $po_kode,
    'tipe'          => 1,
    'inv_tgl'       => $tanggal_inv_send,
    'ref_kode'      => $ref_kode,
    'ref_tgl'       => $ref_tgl_send,
    'pajak_no'      => $pajak_no,
    'pajak_tgl'     => $pajak_tgl_send,
    'tgl_jatuh_tempo' => $tgl_jatuh_tempo_send,
    'tax_base'      => $tax_base,
    'ppn_amount'    => $ppn_amount,
    'pph_amount'    => $pph_amount,
    'amount'        => $grand_total,
    'note'          => $note,
    'create_by'     => Core::GetState('id'),
    'create_date'   => $Date,
    'history'       => $History,
    'status'        => 1
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

        $FieldDetail = array(
            'header'        => $Header['id'],
            'dp_pct'        => $dp
        );

        if ($DB->Insert(
            $Table['detail'],
            $FieldDetail
        )) {
            $os_dp_final = $os_dp - $dp;
            $Field = array(
                'os_dp'             => $os_dp_final
            );
            $DB->Update(
                $Table['po'],
                $Field,
                "
                    id = '" . $po . "'
                "
            );
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