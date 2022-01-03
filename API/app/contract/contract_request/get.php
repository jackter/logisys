<?php

$Modid = 183;
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
    'def' => 'kontrak_request',
    'detail' => 'kontrak_request_detail'
);

# Get Data
$Q_Data = $DB->Query(
    $Table['def'],
    array(
        'id',
        'tanggal',
        'company',
        'company_abbr',
        'company_nama',
        'duration',
        'kode',
        'work',
        'work_nama',
        'work_code',
        'cip',
        'cip_kode',
        'kontrak_tipe',
        'grand_total',
        'currency',
        'start_date',
        'end_date',
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
        WHERE 
            id = '" . $id . "'
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

    # Get Detail
    $Q_Detail = $DB->Query(
        $Table['detail'],
        array(
            'id',
            'coa',
            'coa_kode',
            'coa_nama',
            'keterangan',
            'volume',
            'uom',
            'est_rate',
            'total'
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
            $return['data']['list'][$i] = $Detail;

            $i++;
        }

        if (!$is_detail) {
            $return['data']['list'][$i] = array(
                'i' => 0
            );
        }
    }
}
echo Core::ReturnData($return);

?>