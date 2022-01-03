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

$GetID = $DB->Result($Q_GetID = $DB->Query(
    'invoice',
    array(
        'id',
        'tipe'
    ),
    "
        WHERE
            id = '" . $id . "'
    "
));

/**
 * Get Data
 */
$Q_Data = $DB->QueryPort("
    SELECT
        I.id,
        I.kode,
        I.po,
        I.po_kode,
        I.supplier,
        I.supplier_nama,
        I.inv_tgl,
        I.ref_kode,
        I.ref_tgl,
        I.pajak_no,
        I.pajak_tgl,
        I.tgl_jatuh_tempo,
        I.note,
        I.verified,
        I.create_date,
        I.tipe,
        I.sp3,
        I.sp3_kode,
        P.id AS po,
        P.dp,
        ID.dp_pct,
        P.currency,
        P.disc,
        P.total,
        P.ppn,
        P.inclusive_ppn,
        P.pph,
        P.pph_code,
        P.tax_base,
        P.other_cost,
        P.ppbkb,
        P.grand_total,
        P.company,
        P.company_abbr,
        P.company_nama,
        P.currency,
        P.tanggal AS po_tanggal
    FROM
        invoice AS I,
        invoice_detail AS ID,
        po AS P
    WHERE
        I.id = '" . $id . "' AND
        I.po = P.id AND
        I.id = ID.header
");
$R_Data = $DB->Row($Q_Data);

if ($R_Data > 0) {

    while ($Data = $DB->Result($Q_Data)) {
        $return['data'] = $Data;
        $return['data']['tanggal'] = date("D, d M Y", strtotime($Data['inv_tgl']));

        //get Enabled Journal
        $Q_Company = $DB->Result($DB->QueryOn(
            DB['master'],
            "company",
            array(
                'journal'
            ),
            "
                WHERE 
                    id = '" . $Data['company'] . "'
            "
        ));
        $return['data']['enable_journal'] = $Q_Company['journal'];
        
        //=> BUSINESS UNIT TITLE 
        $Business = $DB->Result($DB->QueryOn(
            DB['master'],
            "company",
            array(
                'business_unit'
            ),
            "
                WHERE
                    id = '" . $Data['company'] . "'
            "
        ));
        $return['data']['business_unit'] = $Business['business_unit'];

        /**
         * Get Detail PO
         */
        $Q_Detail = $DB->QueryPort("
            SELECT
                D.id AS detail_id,
                D.item AS id,
                D.qty_po - D.qty_cancel AS qty,
                D.price,
                D.pph,
                TRIM(I.nama) AS nama,
                I.satuan,
                I.in_decimal
            FROM
                item AS I,
                po AS H,
                po_detail AS D,
                invoice AS INV,
                invoice_detail AS INV_D
            WHERE
                H.id = '" . $Data['po'] . "' AND
                H.id = D.header AND
                H.id = INV.po AND
                INV.id = '" . $Data['id'] . "' AND
                INV.id = INV_D.header AND
                D.qty_po - D.qty_cancel > 0 AND
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