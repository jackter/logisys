<?php
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

$invoice_list = json_decode($invoice_send, true);

/**
 * Get Data
 */
if($tipe == 1){
    $inv_id = "";
    for($i = 0; $i < sizeof($invoice_list); $i++){
        if($inv_id == ""){
            $inv_id .= $invoice_list[$i]['id'];
        }
        else{
            $inv_id .= ", " . $invoice_list[$i]['id'];
        }
    }

    $Q_INV_Data = $DB->QueryPort("
        SELECT
            SUM( id.dp_pct ) dp,
            h.disc,
            h.other_cost,
            h.ppbkb,
            h.ppbkb,
            SUM( i.amount ) amount,
            it.nama,
            it.satuan,
            d.qty_po - d.qty_cancel AS qty,
            d.price,
            h.ppn,
            h.inclusive_ppn,
        CASE
                
                WHEN d.pph = 1 THEN
                h.pph ELSE 0 
            END pph,
            h.pph_code,
            h.customs AS customs 
        FROM
            po h,
            po_detail d,
            item it,
            invoice i,
            invoice_detail id 
        WHERE
            i.id IN ( ".$inv_id." ) 
            AND h.id = d.header 
            AND i.tipe = ".$tipe." 
            AND h.id = i.po 
            AND i.id = id.header 
            AND d.item = it.id 
            AND d.qty_po - d.qty_cancel > 0
        GROUP BY
            it.nama
    ");
}
else if($tipe == 2){
    $grn_id = "";
    $inv_id = "";
    for($i =0; $i < sizeof($invoice_list); $i++){
        if($grn_id == ""){
            $grn_id .= $invoice_list[$i]['grn'];
        }
        else{
            $grn_id .= ", " . $invoice_list[$i]['grn'];
        }

        if($inv_id == ""){
            $inv_id .= $invoice_list[$i]['id'];
        }
        else{
            $inv_id .= ", " . $invoice_list[$i]['id'];
        }
    }

    $Q_INV_Data = $DB->QueryPort("
        SELECT
            h.disc,
            h.dp,
            it.nama,
            it.satuan,
            h.inclusive_ppn,
            h.ppn,
            h.pph,
            SUM( ( dg.qty_receipt - dg.qty_return ) ) qty,
            SUM( ( dg.qty_receipt - dg.qty_return ) * d.pph ) qty_pph,
        CASE
                
                WHEN h.inclusive_ppn = 1 THEN
                d.price / 1.1 ELSE d.price 
            END price,
            h.pph_code,
            SUM(
                (
                    ( h.other_cost ) / ( SELECT sum( qty_po - qty_cancel ) FROM po_detail WHERE header = h.id ) * ( dg.qty_receipt - dg.qty_return ) 
                ) 
            ) other_cost,
            SUM(
                (
                    ( h.ppbkb ) / ( SELECT sum( qty_po - qty_cancel ) FROM po_detail WHERE header = h.id ) * ( dg.qty_receipt - dg.qty_return ) 
                ) 
            ) ppbkb,
            h.customs AS customs,
            ( d.qty_po - d.qty_cancel ) *
        CASE
                
                WHEN h.inclusive_ppn = 1 THEN
                d.price / 1.1 ELSE d.price 
            END AS amount_uang_muka,
            ( d.qty_po - d.qty_cancel ) * d.pph *
        CASE
                
                WHEN h.inclusive_ppn = 1 THEN
                d.price / 1.1 ELSE d.price 
            END AS amount_uang_muka_pph,
            i.dp_amount 
        FROM
            po h,
            po_detail d,
            gr hg,
            gr_detail dg,
            item it,
            invoice i 
        WHERE
            h.id = d.header 
            AND h.id = hg.po 
            AND hg.id = dg.header 
            AND d.item = dg.item 
            AND ( dg.qty_receipt - dg.qty_return ) > 0 
            AND d.item = it.id 
            AND hg.inv = i.id 
            AND hg.id IN ( ". $grn_id ." ) 
        GROUP BY
            d.item
    ");
}
else if($tipe == 4){
    $inv_id = "";
    for($i = 0; $i < sizeof($invoice_list); $i++){
        if($inv_id == ""){
            $inv_id .= $invoice_list[$i]['id'];
        }
        else{
            $inv_id .= ", " . $invoice_list[$i]['id'];
        }
    }

    $Q_INV_Data = $DB->QueryPort("
        SELECT
            ie.jumlah,
            ie.keterangan AS uraian
        FROM
            invoice i,
            invoice_expense ie 
        WHERE
            i.id IN ( ".$inv_id." ) 
            AND i.id = ie.header 
            AND i.tipe = ".$tipe."
        GROUP BY
            ie.keterangan
    ");
}
$R_INV_Data = $DB->Row($Q_INV_Data);
if($R_INV_Data > 0){

    $i = 0;
    while($INV_Data = $DB->Result($Q_INV_Data)){

        $return[$i] = $INV_Data;
        $return[$i]['tipe'] = $tipe;

        $i++;
    }

}

if($tipe == 2){
    $Q_EXP = $DB->Query(
        "invoice_expense",
        array(
            'header',
            'coa',
            'coa_kode' => 'kode',
            'coa_nama' => 'nama',
            'jumlah' => 'amount',
            'keterangan' => 'notes'
        ),
        "
            WHERE
                header IN (" . $inv_id . ")
        "
    );
    $R_EXP = $DB->Row($Q_EXP);
    if ($R_EXP > 0) {
        while ($EXP = $DB->Result($Q_EXP)) {
            $return[$i] = $EXP;
            $i++;
        }
    }
    //=> / END : Get Data
}

echo Core::ReturnData($return);
?>