<?php

$Modid = 65;

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

if ($receive_process == 1) {
    Perm::Check($Modid, 'approve_rcv');
} else {
    Perm::Check($Modid, 'approve');
}

$Table = array(
    'def'       => 'transfer_fg'
);

$detail = json_decode($detail, true);

/**
 * Update Verify
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
    'table'         => $Table['def'],
    'clause'        => "WHERE id = '" . $id . "'",
    'action'        => "approve",
    'description'   => "Approve TFG " . $kode
);
$History = Core::History($HistoryField);

$Field = array(
    'update_by'      => Core::GetState('id'),
    'update_date'    => $Date,
    'history'        => $History
);

if ($receive_process == 1) {
    $Field['approved_rcv'] = 1;
    $Field['approved_by_rcv'] = Core::GetState('id');
    $Field['approved_date_rcv'] = $Date;

    for ($i = 0; $i < sizeof($detail); $i++) {
        $Jurnal = App::JurnalStock(array(
            'tipe'      => 'debit',
            'company'   => $company,
            'dept'      => $dept,
            'storeloc'  => $detail[$i]['storeloc'],
            'item'      => $detail[$i]['id'],
            'qty'       => $detail[$i]['qty_receive'],
            'price'     => $detail[$i]['price'],
            'kode'      => $kode
        ));
    }
} else {
    $Field['approved'] = 1;
    $Field['approved_by'] = Core::GetState('id');
    $Field['approved_date'] = $Date;

    for ($i = 0; $i < sizeof($detail); $i++) {
        $Jurnal = App::JurnalStock(array(
            'tipe'      => 'credit',
            'company'   => $company,
            'dept'      => $dept,
            'storeloc'  => $storeloc,
            'item'      => $detail[$i]['id'],
            'qty'       => $detail[$i]['qty_send'],
            'price'     => $detail[$i]['price'],
            'kode'      => $kode
        ));
    }
}
$DB->ManualCommit();

if ($DB->Update(
    $Table['def'],
    $Field,
    "id = '" . $id . "'"
)) {
    $DB->Commit();

    $return['status'] = 1;
} else {
    $return = array(
        'status'    => 0,
        'error_msg' => $GLOBALS['mysql']->error
    );
}
//=> / END: Update Verify

echo Core::ReturnData($return);

?>