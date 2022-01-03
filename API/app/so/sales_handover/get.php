<?php

$Modid = 200;
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
    'def' => 'sales_handover',
    'detail' => 'sales_handover_detail'
);

# Get Data
$Q_Data = $DB->Query(
    $Table['def'],
    array(
        'id',
        'tanggal',
        'kode',
        'company',
        'company_abbr',
        'company_nama',
        'cust',
        'cust_kode',
        'cust_nama',
        'cust_abbr',
        'kontrak',
        'kontrak_kode',
        'kontrak_tanggal',
        'item',
        'item_kode',
        'item_nama',
        'item_satuan',
        'so',
        'so_kode',
        'qty_so',
        'qty_total',
        'remarks',
        'create_by',
        'create_date',
        'verified',
        'verified_by',
        'verified_date',
        'approved',
        'approved_by',
        'approved_date'
    ),
    "
        WHERE id = '" . $id . "'
"
);
$R_Data = $DB->Row($Q_Data);

if ($R_Data > 0) {
    $Data = $DB->Result($Q_Data);

    $return['data'] = $Data;

    $return['data']['create_by'] = Core::GetUser("nama", $Data['create_by']);
    $return['data']['create_date'] = date("d/m/Y H:i:s", strtotime($Data['create_date'])) . " WIB";

    if (!empty($Data['verified_by'])) {
        $return['data']['verified_by'] = Core::GetUser("nama", $Data['verified_by']);
        $return['data']['verified_date'] = date("d/m/Y H:i:s", strtotime($Data['verified_date'])) . " WIB";
    }

    if (!empty($Data['approved_by'])) {
        $return['data']['approved_by'] = Core::GetUser("nama", $Data['approved_by']);
        $return['data']['approved_date'] = date("d/m/Y H:i:s", strtotime($Data['approved_date'])) . " WIB";
    }

    # Get Detail
    $Q_Detail = $DB->Query(
        $Table['detail'],
        array(
            'id',
            'ship_tanggal',
            'ship_kode',
            'qty_shipping',
            'remarks'
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
            $i++;
        }
    }
}

echo core::ReturnData($return);

?>
