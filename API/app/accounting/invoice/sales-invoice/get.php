<?php
$Modid = 72;

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

$Table = array(
    'bl'       => 'bl'
);

/**
 * Get Data
 */
$Q_Data = $DB->QueryPort("
    SELECT
        I.id,
        I.sc,
        I.sc_kode,
        I.company,
        I.company_abbr,
        I.company_nama,
        I.cust,
        I.cust_kode,
        I.cust_nama,
        I.cust_abbr,
        I.inv_tgl,
        I.tipe,
        I.note,
        K.dp,
        K.ppn,
        K.inclusive_ppn,
        K.sold_price,
        K.grand_total,
        K.qty,
        K.transport
    FROM
        sales_invoice AS I,
        kontrak AS K 
    WHERE
        I.id = '" . $id . "' 
        AND I.sc = K.id
");
$R_Data = $DB->Row($Q_Data);

if ($R_Data > 0) {

    while ($Data = $DB->Result($Q_Data)) {

        $return['data'] = $Data;

        if($Data['transport'] == 0){
            $Q_BL = $DB->Query(
                $Table['bl'],
                array(
                    'id',
                    'kode',
                    'item',
                    'item_kode',
                    'item_nama',
                    'item_satuan',
                    'qty_bl' => 'qty'
                ),
                "
                    WHERE
                        kontrak = " . $Data['sc'] . "
                "
            );

            $R_BL = $DB->Row($Q_BL);
            if($R_BL > 0){
                $i = 0;
                while($BL = $DB->Result($Q_BL)){
                    $return['data']['accrued'][$i] = $BL;
                    $return['data']['accrued'][$i]['price'] = $Data['sold_price'];
                    $i++;
                }
            }
        }

    }
}
//=> END : Get Data

echo Core::ReturnData($return);

?>