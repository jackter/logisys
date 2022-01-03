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

/**
 * Get Data
 */
$Q_Data = $DB->Query(
    'invoice',
    array(),
    "
        WHERE
            id = '" . $id . "'
    "
);
$R_Data = $DB->Row($Q_Data);
if($R_Data > 0) {
    
    $Data = $DB->Result($Q_Data);
    $return['data'] = $Data;

    $Q_Detail = $DB->Query(
        'invoice_expense',
        array(),
        "
            WHERE
                header = '" . $id . "'
        "
    );
    $R_Detail = $DB->Row($Q_Detail);

    if($R_Detail > 0) {
        $i = 0;
        while($Detail = $DB->Result($Q_Detail)) {

            $return['list'][$i] = $Detail;
            $i++;
        }
    }

    $return['data'] = $Data;
    $return['data']['tanggal'] = date("D, d M Y", strtotime($Data['inv_tgl']));

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
}
//=> END : Get Data

echo Core::ReturnData($return);

?>