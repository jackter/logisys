<?php

$Modid = 209;
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
        ( SELECT date_target FROM mr WHERE P.mr = id ORDER BY date_target DESC LIMIT 1) AS mr_date,
        I.kode AS item_kode,
        I.nama AS item_nama,
        I.satuan AS item_satuan,
        ( SELECT MD.qty FROM mr M, mr_detail MD WHERE P.mr = M.id AND M.id = MD.header AND MD.item = PRD.item limit 1) AS qty,
        ( SELECT MD.qty_approved FROM mr M, mr_detail MD WHERE P.mr = M.id AND M.id = MD.header AND MD.item = PRD.item limit 1) AS qty_approved,
        P.kode AS pr_kode,
        P.tanggal AS pr_date,
        P.approved_date AS pr_approved,
        PRD.item AS item,
        PO.kode AS po_kode,
        PO.tanggal AS po_date,
        PO.supplier_nama,
        PO.currency,
        PO.date_target,
        PO.dp,
        POD.qty_po,
        POD.qty_cancel,
        (POD.qty_po - POD.qty_cancel) as oty_outstanding,
        POD.price
    FROM
        pr P,
        pr_detail PRD,
        po PO,
        po_detail POD,
        item I
    WHERE
        PRD.item = I.id 
        AND P.id = PRD.header 
        AND PRD.item = POD.item 
        AND P.id = PO.pr 
        AND PO.id = POD.header 
        AND PO.is_close = 0
        AND (select count(po) as po from gr where po = PO.id) = 0
        $CLAUSE
");
$R_Data = $DB->Row($Q_Data);

if($R_Data > 0){

    $i = 0;
    while($Data = $DB->Result($Q_Data)){

        $return['data'][$i] = $Data;
        $i++;
    }
}

echo Core::ReturnData($return);

?>