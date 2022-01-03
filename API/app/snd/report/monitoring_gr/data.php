<?php
$Modid = 97;

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
    AND G.tanggal BETWEEN '" . $fdari . " 00:00:00' AND '" . $fhingga . " 23:59:59'
    AND P.company = '" . $company . "'
";

$Q_Data = $DB->QueryPort("
    SELECT
        P.company_abbr,
        P.dept_abbr,
        P.mr,
        P.mr_kode,
        /*M.date_target AS mr_date,*/
        ( SELECT date_target FROM mr WHERE P.mr = id ) AS mr_date,
        I.kode AS item_kode,
        I.nama AS item_nama,
        /*MD.qty,
        MD.qty_approved,*/
        ( SELECT MD.qty FROM mr M, mr_detail MD WHERE P.mr = M.id AND M.id = MD.header AND MD.item = PRD.item ) AS qty,
        ( SELECT MD.qty_approved FROM mr M, mr_detail MD WHERE P.mr = M.id AND M.id = MD.header AND MD.item = PRD.item ) AS qty_approved,
        P.kode AS pr_kode,
        P.tanggal AS pr_date,
        PRD.item AS item,
        PRD.qty_purchase AS qty_pr,
        PO.id as po,
        PO.kode AS po_kode,
        PO.tanggal AS po_date,
        PO.supplier_nama,
        PO.currency,
        PO.dp,
        POD.qty_po,
        POD.qty_cancel,
        G.kode as gr_kode,
        G.tanggal as gr_date,
        GD.qty_receipt as qty_receive,
        GD.qty_return,
        (GD.qty_sisa - POD.qty_cancel) as qty_outstanding
    FROM
        pr P,
        pr_detail PRD,
        po PO,
        po_detail POD,
        item I,
        gr G,
        gr_detail GD
    WHERE
        PRD.item = I.id
        AND P.finish = 1 
        AND P.id = PRD.header 
        AND P.id = PO.pr
        AND PRD.item = POD.item 
        AND PO.id = POD.header
        AND PO.id = G.po
        AND G.id = GD.header
        AND POD.item = GD.item
        AND PO.is_close = 0
        $CLAUSE
    ORDER BY 
        G.tanggal DESC,
        P.id,
        PO.id,
        G.id,
        I.id,
        I.kode ASC
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