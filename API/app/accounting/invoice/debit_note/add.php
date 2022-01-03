<?php

$Modid = 216;
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
    'def'       => 'deb_note',
    'detail'    => 'deb_note_detail',
);

$list = json_decode($list_send, true);

/**
 * Create Code
 */
$Time = date('y') . "/";
$Time2 = romawi(date('n')) . "/";
$InitialCode = "DN/" . strtoupper($company_abbr) . "/" . $Time . $Time2;
$InitialCodeCheck = "DN/" . strtoupper($company_abbr) . "%/" . $Time;
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
    'description'   => "Create Debit Note"
);
$History = Core::History($HistoryField);

$Field = array(
    'kode'          => $kode,
    'company'       => $company,
    'company_abbr'  => $company_abbr,
    'company_nama'  => $company_nama,
    'supplier'      => $supplier,
    'supplier_kode' => $supplier_kode,
    'supplier_nama' => $supplier_nama,
    'inv'           => $inv,
    'inv_kode'      => $inv_kode,
    'tanggal'       => $tanggal_send,
    'amount'        => $amount,
    'grandtotal'    => $totalExpAmount,
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
            if ($list[$i]['coa'] > 0 && $list[$i]['amount'] != 0) {
                $FieldDetail = array(
                    'header'    => $Header['id'],
                    'coa'       => $list[$i]['coa'],
                    'coa_kode'  => $list[$i]['kode'],
                    'coa_nama'  => $list[$i]['nama'],
                    'jumlah'    => $list[$i]['amount'],
                    'keterangan'=> $list[$i]['notes']
                );

                $DB->Insert(
                    $Table['detail'],
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
//>> End: Insert Data

echo Core::ReturnData($return);

?>