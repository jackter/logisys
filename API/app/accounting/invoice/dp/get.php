<?php
$Modid = 46;

Perm::Check($Modid, 'view');

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

/**
 * Get Data
 */
$Q_Data = $DB->QueryPort("
    SELECT
        I.id,
        I.po,
        I.po_kode,
        I.company,
        I.company_abbr,
        I.company_nama,
        I.supplier,
        I.supplier_nama,
        I.inv_tgl,
        I.ref_kode,
        I.ref_tgl,
        I.pajak_no,
        I.pajak_tgl,
        I.tgl_jatuh_tempo,
        I.note,
        I.tipe,
        I.verified,
        P.id AS po,
        P.os_dp AS dp,
        (P.os_dp + ID.dp_pct) AS os_dp,
        P.disc,
        P.total,
        P.ppn,
        P.pph,
        P.inclusive_ppn,
        P.tax_base,
        P.other_cost,
        P.ppbkb,
        P.grand_total
    FROM
        invoice AS I,
        po AS P,
        invoice_detail AS ID
    WHERE
        I.id = '" . $id . "' AND
        I.po = P.id AND
        I.id = ID.header
");
$R_Data = $DB->Row($Q_Data);

if ($R_Data > 0) {

    while ($Data = $DB->Result($Q_Data)) {

        $return['data'] = $Data;

        /**
         * Get Detail PO
         */
        $Q_Detail = $DB->QueryPort("
            SELECT
                D.id AS detail_id,
                D.item AS id,
                D.qty_po AS qty,
                D.price,
                D.pph,
                TRIM(I.nama) AS nama,
                I.satuan,
                I.in_decimal
            FROM
                item AS I,
                po_detail AS D
            WHERE
                D.header = '" . $Data['po'] . "' AND
                D.item = I.id
        ");
        $R_Detail = $DB->Row($Q_Detail);

        if ($R_Detail > 0) {
            $i = 0;
            while ($Detail = $DB->Result($Q_Detail)) {

                $return['list'][$i] = $Detail;

                $i++;
            }
        }
        //=> END : Get Detail PO
    }
}
//=> END : Get Data

echo Core::ReturnData($return);

?>