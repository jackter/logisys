<?php
$Modid = 208;

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
        I.company,
        I.company_abbr,
        I.company_nama,
        I.cust,
        I.cust_kode,
        I.cust_nama,
        I.cust_abbr,
        I.company_bank_id,
        I.company_bank_nama,
        I.company_bank,
        I.company_rek,
        I.pc_kode,
        I.ship_tgl,
        I.inv_tgl,
        I.currency,
        I.tipe,
        I.term,
        I.note,
        I.amount AS total_amount
    FROM
        sales_invoice AS I
    WHERE
        I.id = '" . $id . "'
");
$R_Data = $DB->Row($Q_Data);

if ($R_Data > 0) {

    $Data = $DB->Result($Q_Data);

    $return['data'] = $Data;

    /**
     * Detail
     */
    $Q_Detail = $DB->Query(
        'sales_invoice_expense',
        array(),
        "
            WHERE
                header = '" . $id . "'
        "
    );
    $R_Detail = $DB->Row($Q_Detail);
    if ($R_Detail > 0) {

        $i = 0;
        while ($Detail = $DB->Result($Q_Detail)) {

            $return['data']['list'][$i] = $Detail;
            $return['data']['list'][$i]['amount'] = $Detail['jumlah'];
            $i++;
        }
    }
    //=> END : Detail

}
//=> END : Get Data

echo Core::ReturnData($return);

?>