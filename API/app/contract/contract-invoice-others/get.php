<?php
$Modid = 178;
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
    'def'           => 'kontrak_invoice',
    'detail'        => 'kontrak_agreement_detail',
    'coa_bal'       => 'trx_coa_balance'
);

$Q_Data = $DB->Query(
    $Table['def'],
    array(
        'id',
        'kode',
        'company',
        'company_abbr',
        'company_nama',
        'kontraktor',
        'kontraktor_kode',
        'kontraktor_nama',
        'agreement',
        'agreement_kode',
        'invoice',
        'invoice_kode',
        'tanggal',
        'tipe' => 'other_invoice_type',
        'payment_retention',
        'currency',
        'ppn',
        'pph_code',
        'pph',
        'dp_percent',
        'total_dp',
        'total_amount',
        'total_ppn',
        'total_pph',
        'grand_total',
        'remarks',
        'verified',
        'verified_by',
        'verified_date',
        'approved',
        'approved_by',
        'approved_date',
        'create_by',
        'create_date'
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

    //get Enabled Journal
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

    /**
     * Get Detail
     */
    if($Data['other_invoice_type'] == 1){
        $Q_Detail = $DB->Query(
            $Table['detail'],
            array(
                'coa',
                'coa_kode',
                'coa_nama',
                'volume',
                'rate',
                'uom',
                'amount',
                'remarks'
            ),
            "WHERE
                header = '" . $Data['agreement'] . "'"
        );
    }
    else{
        $Q_Detail = $DB->Query(
            $Table['coa_bal'],
            array(
                'coa',
                'coa_kode',
                'coa_nama'
            ),
            "WHERE
                doc_nama = 'Contract Invoice Others'
                AND seq = 2
                AND company = '" . $Data['company'] . "'"
        );
    }
    $R_Detail = $DB->Row($Q_Detail);

    if($R_Detail > 0) {
        while($Detail = $DB->Result($Q_Detail)) {
            if($Data['other_invoice_type'] == 2){
                $Detail['remarks'] = 'Invoice Retensi untuk '.$Data['invoice_kode'];
                $Detail['amount'] = $Data['total_amount'];
            }
            $return['data']['list'][] = $Detail;
        }
    }
    //=> END : Get Detail
}
echo Core::ReturnData($return);

?>