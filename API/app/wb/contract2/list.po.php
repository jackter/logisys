<?php
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
    'def'           => 'po',
    'po_detail'     => 'po_detail'
);

$CLAUSE = "";
if ($keyword != '' && isset($keyword)) {
    $CLAUSE .= " 
        AND (po.kode LIKE '%" . $keyword . "%'
        OR po.supplier_nama LIKE '%" . $keyword . "%')
    ";
}

if ($supplier != '' && isset($supplier)) {
    $CLAUSE .= "
        AND supplier = '" . $supplier . "'
    ";
}

if($po) {
    $CLAUSE .= "
        AND id NOT IN (" . $po . ")
    ";
}

/**
 * Get Data
 */
$Q_PO = $DB->Query(
    $Table['def'],
    array(
        'id',
        'kode',
        'supplier_nama',
    ),
    "
        WHERE
            IFNULL(submited, 0) = 0
            AND is_void = 0
            AND po_contract = 1
            AND IFNULL(wb_kontrak, 0) = 0
            $CLAUSE
        GROUP BY
            id
    "
);
$R_PO = $DB->Row($Q_PO);
if ($R_PO > 0) {

    $i = 0;
    while ($PO = $DB->Result($Q_PO)) {

        $return[$i] = $PO;

        $i++;
    }
}

//=> / END : Get Data

echo Core::ReturnData($return);

?>