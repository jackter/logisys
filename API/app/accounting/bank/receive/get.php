<?php

#Default statement
$return = [];
$RPL = "";
$SENT = Core::Extract($_POST, $RPL);

#Extract Array
if (isset($SENT)) {
    foreach ($SENT as $KEY => $VAL) {
        $$KEY = $VAL;
    }
}

$Table = array(
    'def'   => 'br',
    'def2'  => 'br_detail'
);

#Get Data
$Q_Data = $DB->Query(
    $Table['def'],
    array(
        'id',
        'kode',
        'company',
        'tanggal',
        'company_abbr',
        'company_nama',
        'company_bank',
        'bank',
        'bank_kode',
        'bank_nama',
        'bank_coa',
        'bank_coa_kode',
        'bank_coa_nama',
        'no_rekening',
        'currency',
        'rate',
        'reff_type',
        'subjek',
        'subjek_nama',
        'customer',
        'customer_kode',
        'customer_nama',
        'total',
        'remarks',
        'rekon',
        'approved',
        'status'
    ),
    "
        WHERE 
            id = '" . $id . "'
    "
);
$R_Data = $DB->Row($Q_Data);

if ($R_Data > 0) {
    $Data = $DB->Result($Q_Data);

    $return['data'] = $Data;

    $Business = $DB->Result($DB->QueryOn(
        DB['master'],
        "company",
        array(
            'business_unit',
            'alamat'
        ),
        "
            WHERE
                id = '" . $Data['company'] . "'
        "
    ));
    $return['data']['business_unit'] = $Business['business_unit'];
    $return['data']['company_alamat'] = str_replace("\\n", "<br/>", stripslashes($Business['alamat']));

    #Get BPU Detail
    $Q_Detail = $DB->Query(
        $Table['def2'],
        array(
            'id',
            'header',
            'reff_id',
            'reff_kode',
            'coa',
            'coa_kode',
            'coa_nama',
            'uraian',
            'total'
        ),
        "
            WHERE header = '" . $Data['id'] . "'    
        "
    );
    $R_Detail = $DB->Row($Q_Detail);
    if ($R_Detail > 0) {
        $i = 0;
        while ($Detail = $DB->Result($Q_Detail)) {
            $return['data']['detail'][$i] = $Detail;
            $return['data']['detail'][$i]['company'] = $Data['company'];
            $return['data']['detail'][$i]['company_nama'] = $Data['company_nama'];
            $return['data']['detail'][$i]['total_show'] = decimal($Detail['total']);

            if ($Data['reff_type'] == 1) {
                $Q_InvTipe = $DB->Query(
                    "sales_invoice",
                    array(
                        'tipe'
                    ),
                    "
                    WHERE 
                        id = '" . $Detail['reff_id'] . "'
                    "
                );
                $R_InvTipe = $DB->Row($Q_InvTipe);
                if ($R_InvTipe > 0) {
                    $InvTipe = $DB->Result($Q_InvTipe);

                    $return['data']['detail'][$i]['reff_tipe'] = $InvTipe['tipe'];
                }
            }

            $i++;
        }
    }
}
echo Core::ReturnData($return);

?>