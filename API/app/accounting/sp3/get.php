<?php

$Modid = 109;
Perm::Check($Modid, 'view');

#Default Statement
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
    'def'           => 'sp3',
    'detail'        => 'sp3_detail'
);

#Get Data
$Q_Data = $DB->Query(
    $Table['def'],
    array(
        'id',
        'company',
        'company_abbr',
        'company_nama',
        'cost_center' => 'cost',
        'cost_center_kode' => 'cost_kode',
        'cost_center_nama' => 'cost_nama',
        'kode',
        'tanggal',
        'po_no',
        'po_tgl',
        'penerima',
        'penerima_nama',
        'print_status',
        'currency',
        'total',
        'keterangan_bayar',
        'verified',
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

    #Get SP3 Detail
    $Q_Detail = $DB->Query(
        $Table['detail'],
        array(
            'id',
            'uraian',
            'jumlah'
        ),
        "
            WHERE 
                header = '" . $Data['id'] . "'
        "
    );
    $R_Detail = $DB->Row($Q_Detail);
    if ($R_Detail > 0) {
        $i = 0;
        while ($Detail = $DB->Result($Q_Detail)) {
            $return['data']['detail'][$i] = $Detail;
            $return['data']['detail'][$i]['i'] = $i;

            $i++;
        }


        // $return['data']['detail'][$i]['i'] = $i;
    }
}
echo Core::ReturnData($return);

?>