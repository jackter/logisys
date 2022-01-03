<?php

$Modid = 47;
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
    'detail'    => 'invoice_expense',
    'gr'        => 'gr',
    'po'        => 'po'
);

$list = json_decode($list_send, true);
$list_exp = json_decode($list_exp_send, true);

/**
 * format data 
 */
$GRNID = [];
$format_grn = $COMMA = "";
foreach ($list as $Key => $Val) {
    $format_grn .= $COMMA . $Val['grn'];
    $COMMA = ",";
}
// => end format data

/**
 * Create Code
 */
$Time = date('y') . "/";
$Time2 = romawi(date('n')) . "/";
$InitialCode = "INV-SD/" . strtoupper($company_abbr) . "-" . strtoupper($dept_abbr) . "/" . $Time . $Time2;
$InitialCodeCheck = "INV-SD/" . strtoupper($company_abbr) . "%/" . $Time;
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
    'clause'        => "WHERE kode = '" . $kode . "'",
    'action'        => "add",
    'description'   => "Create Invoice"
);
$History = Core::History($HistoryField);

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
    'inv_tgl'       => $tanggal_inv_send,
    'ref_kode'      => $ref_kode,
    'ref_tgl'       => $tanggal_ref_send,
    'pajak_no'      => $pajak_no,
    'pajak_tgl'     => $tanggal_tax_send,
    'kode'          => $kode,
    'grn_id'        => $format_grn,
    'po'            => $po,
    'po_kode'       => $po_kode,
    'note'          => $note,
    'tipe'          => 2,
    'tax_base'      => $tax_baseTotal - $DP_TaxBase,
    'ppn_amount'    => $ppnTotal - $DP_PPN,
    'pph_amount'    => $pphTotal - $DP_PPh,
    'exp_amount'    => $totalExpAmount,
    'dp_amount'     => $DPAmount,
    'amount'        => $GTAmount,
    'tgl_jatuh_tempo' => $tgl_jatuh_tempo_send,
    'create_by'     => Core::GetState('id'),
    'create_date'   => $Date,
    'history'       => $History,
    'status'        => 1
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
    $INV = $DB->Result($DB->Query(
        $Table['def'],
        array(
            'id',
            'kode',
            'grn_id'
        ),
        "
            WHERE
                po = '" . $po . "' AND
                company = ' " . $company . " ' AND
                supplier = '" . $supplier . "'
            ORDER BY
                id DESC
        "
    ));

    /**
     * Update Status in GRN/PH
     */
    $DB->Update(
        $Table['gr'],
        array(
            'inv'       => $INV['id'],
            'inv_kode'  => $INV['kode']
        ),
        "
            id IN (" . $INV['grn_id'] . ")
        "
    );
    // => End : Update status GRN/PH

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

        for ($i = 0; $i < sizeof($list_exp); $i++) {
            if ($list_exp[$i]['coa'] > 0 && $list_exp[$i]['amount'] != 0) {
                $FieldDetail = array(
                    'header'    => $Header['id'],
                    'coa'       => $list_exp[$i]['coa'],
                    'coa_kode'  => $list_exp[$i]['kode'],
                    'coa_nama'  => $list_exp[$i]['nama'],
                    'jumlah'    => $list_exp[$i]['amount'],
                    'keterangan'    => $list_exp[$i]['notes']
                );

                $DB->Insert(
                    $Table['detail'],
                    $FieldDetail
                );
            }
        }
    }

    if($dp > 0){
        $Field = array(
            'dp_invoice_status' => 1
        );
        $DB->Update(
            $Table['po'],
            $Field,
            "
                id = '" . $po . "'
            "
        );
    }

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