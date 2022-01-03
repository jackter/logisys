<?php
$Modid = 216;

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
    'def'       => 'deb_note',
    'detail'    => 'deb_note_detail',
);

/**
 * Get Data
 */
$Q_Data = $DB->Query(
    $Table['def'],
    array(
        'id',
        'company',
        'company_abbr',
        'company_nama',
        'inv',
        'inv_kode',
        'supplier',
        'supplier_kode',
        'supplier_nama',
        'kode',
        'tanggal',
        'amount',
        'grandtotal',
        'create_date',
        'create_by',
        'verified',
        'verified_by',
        'verified_date',
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
    $return['data']['verified_by'] = Core::GetUser("nama", $Data['verified_by']);

    $INV = $DB->Result($DB->QueryPort(
        "
            SELECT
                currency
            FROM
                invoice
            WHERE
                id = '" . $Data['inv'] . "'
        "
    ));

    $return['data']['currency'] = $INV['currency'];

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

    $Q_EXP = $DB->Query(
        $Table['detail'],
        array(
            'header',
            'coa',
            'coa_kode' => 'kode',
            'coa_nama' => 'nama',
            'jumlah' => 'amount',
            'keterangan' => 'notes'
        ),
        "
            WHERE
                header = '" . $id . "'
        "
    );
    $R_EXP = $DB->Row($Q_EXP);
    if ($R_EXP > 0) {
        while ($EXP = $DB->Result($Q_EXP)) {
            $return['data']['list'][] = $EXP;
        }
    }
}

echo Core::ReturnData($return);

?>