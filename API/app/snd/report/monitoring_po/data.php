<?php
$Modid = 94;

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
    AND ( ( SELECT date_target FROM mr WHERE P.mr = id ) BETWEEN '" . $fdari . " 00:00:00' AND '" . $fhingga . " 23:59:59' OR P.tanggal BETWEEN '" . $fdari . " 00:00:00' AND '" . $fhingga . " 23:59:59' )
    AND P.company = '" . $company . "'
";

$Q_Data = $DB->QueryPort("
    SELECT
        P.company_abbr,
        P.dept_abbr,
        P.mr_kode AS mr_kode,
        ( SELECT date_target FROM mr WHERE P.mr = id ) AS mr_date,
        I.kode AS item_kode,
        I.nama AS item_nama,
        ( SELECT MD.qty FROM mr M, mr_detail MD WHERE P.mr = M.id AND M.id = MD.header AND MD.item = PRD.item ) AS qty,
        ( SELECT MD.qty_approved FROM mr M, mr_detail MD WHERE P.mr = M.id AND M.id = MD.header AND MD.item = PRD.item ) AS qty_approved,
        P.kode AS pr_kode,
        P.tanggal AS pr_date,
        PRD.item AS item,
        PRD.qty_purchase AS qty_pr,
        PO.kode AS po_kode,
        PO.tanggal AS po_date,
        PO.supplier_nama,
        PO.currency,
        PO.dp,
        PO.total,
        PO.disc,
        PO.tax_base / 100 * PO.ppn AS ppn,
        PO.other_cost,
        PO.ppbkb,
        PO.grand_total,
        POD.qty_po,
        POD.qty_cancel,
        POD.price,
        CASE
            
            WHEN POD.pph = 1 THEN
            PO.pph_code ELSE '' 
        END pph_code,
        CASE
            
            WHEN PO.pph != 0 AND POD.pph = 1 THEN
            ( ( POD.qty_po - POD.qty_cancel ) * POD.price / 100 * ( 100- PO.disc ) ) / 100 * PO.pph ELSE 0 
        END pph 
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