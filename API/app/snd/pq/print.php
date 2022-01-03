<?php

$Modid = 31;

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
    'def'       => 'pq',
    'send'      => 'pq_supplier_quotesend'
);

$DescHistory = "Printing Quotations for " . $to . ", date " . date('d/m/Y', strtotime($distribution)) . " - expire " . date('d/m/Y', strtotime($expire));
$HistoryField = array(
    'table'         => $Table['def'],
    'clause'        => "WHERE id = '" . $id . "'",
    'action'        => "print",
    'description'   => $DescHistory
);
$History = Core::History($HistoryField);

$DB->ManualCommit();

if ($DB->Update(
    $Table['def'],
    array(
        'history'   => $History
    ),
    "id = '" . $id . "'"
)) {

    /**
     * Insert to Quotesend
     */
    $Field = array(
        'header_pq_supplier'    => $header_pq_supplier,
        'supplier'              => $supplier,
        'distribution'          => $distribution,
        'expire'                => $expire,
        'create_by'             => Core::GetState('id'),
        'create_date'           => date('Y-m-d H:i:s')
    );
    $DB->Insert(
        $Table['send'],
        $Field
    );
    //=> / END : Insert to Quotesend

    $DB->Commit();

    $return['status'] = 1;
} else {
    $return['status'] = 0;
}

echo Core::ReturnData($return);

?>