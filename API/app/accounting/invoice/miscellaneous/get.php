<?php

$Modid = 202;
Perm::Check($Modid, 'view');

//=> Default Statement
$return = [];
$RPL    = "";
$SENT   = Core::Extract($_POST, $RPL);

//=> Extract Array
if (isset($SENT)) {
    foreach ($SENT as $KEY => $VAL) {
        $$KEY = $VAL;
    }
}

$Q_Data = $DB->Query(
    'invoice',
    array(),
    "
        WHERE
            id = '" . $id . "'
    "
);
$R_Data = $DB->Row($Q_Data);

if ($R_Data > 0) {
    $Data = $DB->Result($Q_Data);
    $return['data'] = $Data;
    $return['data']['total_amount'] = $Data['amount'];

    /**
     * Detail
     */
    $Q_Detail = $DB->Query(
        'invoice_expense',
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

echo Core::ReturnData($return);

?>