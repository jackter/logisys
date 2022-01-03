<?php

$Modid = 210;
Perm::Check($Modid, 'view');

//=> Default Statement
$return = [];
$RPL	= "";
$SENT	= Core::Extract($_POST, $RPL);

//=> Extract Array
if(isset($SENT)){
    foreach($SENT as $KEY => $VAL){	
        $$KEY = $VAL;
    }
}

$return['permissions'] = Perm::Extract($Modid);

$CLAUSE .= "
    AND ( P.tanggal BETWEEN '" . $fdari . " 00:00:00' AND '" . $fhingga . " 23:59:59' )
    AND P.company = '" . $company . "'
";

$PermCompany = Core::GetState('company');
if ($PermCompany != "X") {
    $CLAUSE .= " AND P.company IN (" . $PermCompany . ")";
}

$PermDept = Core::GetState('dept');
if ($PermDept != "X") {
    $CLAUSE .= " AND P.dept IN (" . $PermDept . ")";
}

$PermUsers = Core::GetState('users');
if ($PermUsers != "X") {
    if (!empty($PermUsers)) {
        $CLAUSE .= " AND create_by IN (" . $PermUsers . ")";
    } else {
        $CLAUSE .= " AND create_by = '" . Core::GetState('id') . "'";
    }
}

if (!empty($company)) {
    $CLAUSE .= " AND P.company = '" . $company . "'";
}
if (!empty($dept)) {
    $CLAUSE .= " AND P.dept = '" . $dept . "'";
}

$Q_Data = $DB->QueryPort("
    SELECT
        P.company_abbr,
        P.dept_abbr,
        P.mr_kode AS mr_kode,
        ( SELECT date_target FROM mr WHERE P.mr = id ORDER BY date_target DESC LIMIT 1 ) AS mr_date,
        I.kode AS item_kode,
        I.nama AS item_nama,
        I.satuan AS item_satuan,
        (
        SELECT
            MD.qty 
        FROM
            mr M,
            mr_detail MD 
        WHERE
            P.mr = M.id 
            AND M.id = MD.header 
            AND MD.item = PRD.item 
            LIMIT 1 
        ) AS qty,
        (
        SELECT
            MD.qty_approved 
        FROM
            mr M,
            mr_detail MD 
        WHERE
            P.mr = M.id 
            AND M.id = MD.header 
            AND MD.item = PRD.item 
            LIMIT 1 
        ) AS qty_approved,
        P.kode AS pr_kode,
        P.tanggal AS pr_date,
        P.approved_date AS pr_approved,
        PRD.item AS item,
        PO.id AS po,
        PO.kode AS po_kode,
        PO.tanggal AS po_date,
        PO.supplier_nama,
        PO.currency,
        PO.date_target,
        PO.dp,
        POD.qty_po,
        POD.qty_cancel,
        GR.id AS gr,
        GR.kode AS gr_kode,
        GR.tanggal AS gr_date,
        GRD.qty_receipt,
        GRD.qty_return,
        (SELECT (POD.qty_po - POD.qty_cancel) - SUM(qty_receipt - qty_return) FROM gr, gr_detail WHERE gr.po = PO.id AND gr.id = gr_detail.header AND item = POD.item) AS qty_gr_full,
        POD.price 
    FROM
        pr P,
        pr_detail PRD,
        po PO,
        po_detail POD,
        item I,
        gr GR,
        gr_detail GRD 
    WHERE
        PRD.item = I.id 
        AND P.id = PRD.header 
        AND PRD.item = POD.item 
        AND P.id = PO.pr 
        AND PO.id = POD.header 
        AND PO.id = GR.po 
        AND GR.id = GRD.header 
        AND PO.is_close = 0 
        AND PO.submited = 1 
        AND ( SELECT count( po ) AS po FROM gr WHERE po = PO.id ) >= 1
        AND GRD.item = POD.item
        $CLAUSE
");
$R_Data = $DB->Row($Q_Data);

if($R_Data > 0){

    $i = 0;
    while($Data = $DB->Result($Q_Data)){

        $return['data'][$i] = $Data;

        $return['data'][$i]['qty_outstanding'] = $DB->Result($DB->QueryPort("
            SELECT
                ( " . ($Data['qty_po'] - $Data['qty_cancel']) . " ) - SUM( qty_receipt - qty_return )  AS qty_outstanding
            FROM
                gr_detail 
            WHERE
                item = " . $Data['item'] . " 
                AND header IN ( SELECT id FROM gr WHERE id <= " . $Data['gr'] . " AND po = " . $Data['po'] . " )
        "))['qty_outstanding'];

        $i++;
    }
}

echo Core::ReturnData($return);

?>