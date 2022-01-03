<?php

$Modid = 208;
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
    'def'       => 'sales_invoice'
);

/**
 * Create Code
 */
$Time = date('y') . "/";
$Time2 = romawi(date('n')) . "/";
$InitialCode = "SINV-MISC/" . strtoupper($company_abbr) . "/" . $Time . $Time2;
$InitialCodeCheck = "SINV-MISC/" . strtoupper($company_abbr) . "/" . $Time;

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
    'description'   => "Create New Sales Invoice Misc (" . $kode . ")"
);
$History = Core::History($HistoryField);

$list = json_decode($list_send, true);

$Field = array(
    'company'       => $company,
    'company_abbr'  => $company_abbr,
    'company_nama'  => $company_nama,
    'kode'          => $kode,
    'pc_kode'       => $sc_kode,
    'tipe'          => 3,
    'term'          => $term,
    'cust'          => $cust,
    'cust_kode'     => $cust_kode,
    'cust_nama'     => $cust_nama,
    'cust_abbr'     => $cust_nama,
    'company_bank_id'   => $company_bank_id,
    'company_bank_nama' => $company_bank_nama,
    'company_bank'      => $company_bank,
    'company_rek'       => $company_rek,
    'inv_tgl'       => $inv_tgl_send,
    'ship_tgl'      => $ship_tgl_send,
    'currency'      => $currency,
    'amount'        => $total_amount,
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
                    $Table['def']."_expense",
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