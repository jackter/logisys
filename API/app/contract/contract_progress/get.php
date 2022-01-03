<?php

$Modid = 180;
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
    'def'       => 'kontrak_progress',
    'detail'    => 'kontrak_progress_detail',
    'agree'     => 'kontrak_agreement',
    'req'       => 'kontrak_request'
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
        'tanggal',
        'start_date',
        'end_date',
        'ppn',
        'pph_code',
        'pph',
        'currency',
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

    $Agreement = $DB->Result($DB->Query(
        $Table['agree'],
        array(
            'req',
            'currency'
        ),
        "
            WHERE
                id = '" . $Data['agreement'] . "'
        "
    ));
    $return['data']['currency'] = $Agreement['currency'];

    $Req = $DB->Result($DB->Query(
        $Table['req'],
        array(
            'cip',
            'cip_kode',
            'kontrak_tipe'
        ),
        "
            WHERE
                id = '" . $Agreement['req'] . "'
        "
    ));
    $return['data']['cip'] = $Req['cip'];
    $return['data']['cip_kode'] = $Req['cip_kode'];
    $return['data']['kontrak_tipe'] = $Req['kontrak_tipe'];

    /** 
     * Get Detail
     */
    $Q_Detail = $DB->Query(
        $Table['detail'],
        array(
            'header_detail_agreement',
            'coa',
            'coa_kode',
            'coa_nama',
            'volume',
            'rate',
            'uom',
            'amount',
            'remarks',
            'keterangan',
            'current_progress',
            'progress'
        ),
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
            $i++;
        }
    }
    //=> END : Get Detail

}
echo Core::ReturnData($return);

?>