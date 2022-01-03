<?php

$Modid = 46;
Perm::Check($Modid, 'hapus');

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
    'detail'    => 'invoice_detail',
    'po'        => 'po',
    'po_detail' => 'po_detail'
);

$DB->ManualCommit();

if ($tipe == 1) {
    $Q_Detail = $DB->QueryPort("
        SELECT
            h.id,
            h.os_dp,
            id.dp_pct
        FROM
            po h,
            invoice i,
            invoice_detail id 
        WHERE
            h.id = i.po 
            AND i.id = id.header
            AND i.id = " . $id . "
    ");
    $R_Detail = $DB->Row($Q_Detail);
    if ($R_Detail > 0) {
        while ($Detail = $DB->Result($Q_Detail)) {
            $os_dp = $Detail['os_dp'] + $Detail['dp_pct'];
            $DB->Update(
                $Table['po'],
                array(
                    'os_dp'      => $os_dp
                ),
                "
                    id = '" . $Detail['id'] . "'
                "
            );
        }
    }

    if ($DB->Delete(
        $Table['detail'],
        "
            header = '" . $id . "'
        "
    )) {
        if ($DB->Delete(
            $Table['def'],
            "
                id = '" . $id . "'
            "
        )) {
            $DB->Commit();
            $return['status'] = 1;
        } else {
            $return = array(
                'status'        => 0,
                'error_msg'     => "Cannot Delete Processed Invoice Down Payment"
            );
        }
    }
} else if ($tipe == 3) {
    $Q_Detail = $DB->QueryPort("
        SELECT
            d.id,
            d.qty_po,
            d.qty_invoice AS qty_inv_a,
            id.qty_invoice AS qty_inv_b 
        FROM
            po h,
            po_detail d,
            invoice i,
            invoice_detail id 
        WHERE
            h.id = d.header 
            AND h.id = i.po 
            AND i.id = id.header 
            AND d.item = id.item 
            AND i.id = " . $id . "
    ");
    $R_Detail = $DB->Row($Q_Detail);
    if ($R_Detail > 0) {
        while ($Detail = $DB->Result($Q_Detail)) {
            $qty_invoice = $Detail['qty_inv_a'] - $Detail['qty_inv_b'];
            $return['qty_invoice'] = $qty_invoice;
            $DB->Update(
                $Table['po_detail'],
                array(
                    'qty_invoice'      => $qty_invoice
                ),
                "
                    id = '" . $Detail['id'] . "'
                "
            );
        }
    }

    if ($DB->Delete(
        $Table['detail'],
        "
            header = '" . $id . "'
        "
    )) {
        if ($DB->Delete(
            $Table['def'],
            "
                id = '" . $id . "'
            "
        )) {
            $DB->Commit();
            $return['status'] = 1;
        } else {
            $return = array(
                'status'        => 0,
                'error_msg'     => "Cannot Delete Processed Invoice Supplier Based"
            );
        }
    }
}

echo Core::ReturnData($return);

?>