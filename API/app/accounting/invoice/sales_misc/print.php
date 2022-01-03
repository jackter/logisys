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
    'cust'      => 'customer'
);

/**
 * Get Data
 */
$Q_Data = $DB->QueryPort("
    SELECT
        I.id,
        I.pc_kode,
        I.kode,
        I.company,
        I.company_abbr,
        I.company_nama,
        I.term,
        I.cust,
        I.cust_kode,
        I.cust_nama,
        I.cust_abbr,
        I.company_bank_id,
        I.company_bank,
        I.company_bank_nama,
        I.company_rek,
        I.sc_kode,
        I.inv_tgl,
        I.ship_tgl,
        I.tipe,
        I.currency,
        I.note,
        I.amount,
        I.verified
    FROM
        sales_invoice AS I
    WHERE
        I.id = '" . $id . "'
");
$R_Data = $DB->Row($Q_Data);

if ($R_Data > 0) {

    while ($Data = $DB->Result($Q_Data)) {
        $return['data'] = $Data;
        $return['data']['tanggal'] = date("D, d M Y", strtotime($Data['create_date']));
        
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

        /**
         * Select Customer
         */
        $Company = $DB->Result($DB->QueryOn(
            DB['master'],
            "company",
            array(
                "alamat"
            ),
            "
                WHERE
                    id = '" . $Data['company'] . "'
            "
        ));
        $return['data']['company_alamat'] = $Company['alamat'];
        //=> / END : Select Supplier
        
        /**
         * Select Customer
         */
        $Customer = $DB->Result($DB->Query(
            $Table['cust'],
            array(
                'kabkota'       => 'kab',
                'provinsi'      => 'prov',
                'country_nama'  => 'negara',
                'cp',
                'cp_telp1',
                'cp_telp2',
                'cp_hp1',
                'cp_hp2'
            ),
            "
                WHERE
                    id = '" . $Data['cust'] . "'
            "
        ));
        $return['data']['cust_detail'] = $Customer;
        //=> / END : Select Supplier
    }
}
//=> END : Get Data

echo Core::ReturnData($return);

?>