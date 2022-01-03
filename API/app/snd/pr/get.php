<?php

$Modid = 30;
Perm::Check($Modid, 'view');

// include "_function.php";

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
 * Check Special Logo for Print
 */
// $ShowLogo = array(
//     'CKA',
//     'AMJ',
//     'ENM',
//     'MP',
//     'IJI',
//     'BSG',
//     'NSP',
//     'PNAK'
// );
//=> / END : Check Special Logo For Print

$Table = array(
    'def'       => 'pr',
    'detail'    => 'pr_detail',
    'pq'        => 'pq',
    'mr'        => 'mr',
    'par'       => 'wf_params'
);

/**
 * Get Data
 */
$Q_Data = $DB->Query(
    $Table['def'],
    array(
        'id',
        'kode'      => 'pr_kode',
        'tanggal',
        'company',
        'company_abbr',
        'company_nama',
        'dept',
        'dept_abbr',
        'dept_nama',
        'mr',
        'mr_kode'   => 'kode',
        'note',
        'verified',
        'approved',
        'approved2',
        'approved3',
        'finish',
        'is_void',
        'create_by',
        'create_date',
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

    // if (in_array($Data['company_abbr'], $ShowLogo)) {
    //     $Data['show_logo'] = 1;
    // }

    $return['data'] = $Data;
    $return['data']['qr'] = DX::SDX($Data['pr_kode']);

    $return['data']['create_by'] = Core::GetUser("nama", $Data['create_by']);
    $return['data']['create_date'] = date("d/m/Y H:i:s", strtotime($Data['create_date'])) . " WIB";

    $return['data']['mr_create_by'] = Core::GetUser("nama", $Data['create_by']);
    $return['data']['mr_create_date'] = date("d/m/Y H:i:s", strtotime($Data['create_date'])) . " WIB";

    $return['data']['approved_by'] = Core::GetUser("nama", $Data['create_by']);
    $return['data']['approved_date'] = date("d/m/Y H:i:s", strtotime($Data['create_date'])) . " WIB";

    $Q_PRApproval = $DB->QueryOn(
        DB['master'],
        "company",
        array(
            'pr_approval'
        ),
        "
            WHERE 
                id = '" . $Data['company'] . "'
        "
    );
    $R_PRApproval = $DB->Row($Q_PRApproval);
    if ($R_PRApproval > 0) {
        while ($PRApproval = $DB->Result($Q_PRApproval)) {
            $return['data']['pr_approval'] = json_decode($PRApproval['pr_approval'], true);
        }
    }


    if ($Data['mr']) {

        $MR = $DB->Result($DB->Query(
            $Table['mr'],
            array(
                'note',
                'create_by',
                'create_date',
                'verified_by',
                'verified_date',
                'approved_by',
                'approved_date'
            ),
            "WHERE id = '" . $Data['mr'] . "'"
        ));

        $return['data']['note'] = $MR['note'];

        /**
         * Approval Informations
         */
        if ($MR['create_by'] != 0) {
            $return['data']['mr_create_by'] = Core::GetUser("nama", $MR['create_by']);
            $return['data']['mr_create_date'] = date("d/m/Y H:i:s", strtotime($MR['create_date'])) . " WIB";
        }

        if ($MR['approved_by'] != 0) {
            $return['data']['approved_by'] = Core::GetUser("nama", $MR['approved_by']);
            $return['data']['approved_date'] = date("d/m/Y H:i:s", strtotime($MR['approved_date'])) . " WIB";
        }
    }

    if ($Data['verified'] != 0) {
        $return['data']['scm_verified_by'] = Core::GetUser("nama", $Data['verified_by']);
        $return['data']['scm_verified_date'] = date("d/m/Y H:i:s", strtotime($Data['verified_date'])) . " WIB";
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

    // if (
    //     $Data['dept'] == 10 ||
    //     $Data['dept'] == 48 ||
    //     $Data['dept'] == 38 ||
    //     $Data['dept'] == 57 ||
    //     $Data['dept'] == 39 ||
    //     $Data['dept'] == 49
    // ) {
    //     $return['data']['approved_by_1'] = "RUDY BOKSLAG";
    // } else {
    //     // $return['data']['approved_by_1'] = "SUMALI";
    //     $return['data']['approved_by_1'] = $return['data']['pr_approval'][4]['nama'];
    // }

    // if(
    //     $Data['company'] == 5 || 
    //     $Data['company'] == 39
    // ){
    //     // $return['data']['approved_by_1'] = "RUDY BOKSLAG";
    //     $return['data']['approved_by_1'] = "HARRY AGOES BASOEKI";
    // }

    // if(
    //     $Data['company'] == 13 || 
    //     $Data['company'] == 14 || 
    //     $Data['company'] == 15 || 
    //     $Data['company'] == 16
    // ){
    //     $return['data']['approved_by_1'] = "HARI NUGROHO";
    // }

    //=> APPROVED 2
    // $return['data']['approved_by_2'] = "OKTORIKO PARAVANSA";

    //=> APPROVED 3
    // $return['data']['approved_by_3'] = $return['data']['pr_approval'][5]['nama'];

    //=> APPROVED 2
    // $return['data']['approved_by_4'] = $return['data']['pr_approval'][6]['nama'];

    // if(
    //     $Data['company'] == 7 || 
    //     $Data['company'] == 8 || 
    //     $Data['company'] == 9 || 
    //     $Data['company'] == 10 || 
    //     $Data['company'] == 11 || 
    //     $Data['company'] == 12
    // ){
    //     $return['data']['approved_by_1'] = "JEMMY AR";
    //     $return['data']['approved_by_3'] = "HANJIN PARK";
    //     $return['data']['approved_by_4'] = "JUPRIANTO";
    // }

    //=> / END : Approval Informations

    /**
     * Extract Detail
     */
    $Q_Detail = $DB->QueryPort("
        SELECT
            D.id AS detail_id,
            D.item AS id,
            D.qty_mr AS qty_approved,
            D.qty_purchase,
            D.est_price,
            D.remarks,

            I.kode,
            I.nama,
            I.satuan,
            I.in_decimal
        FROM
            item AS I,
            " . $Table['detail'] . " AS D
        WHERE
            D.header = '" . $id . "' AND
            D.item = I.id
    ");
    $R_Detail = $DB->Row($Q_Detail);

    $ALL_STOCK = 0;
    if ($R_Detail > 0) {
        $i = 0;
        while ($Detail = $DB->Result($Q_Detail)) {
            $return['data']['list'][$i] = $Detail;
            $return['data']['list'][$i]['i'] = $i;

            /**
             * Get Stock
             */
            $STOCK = App::GetStockAll(array(
                'company'   => $Data['company'],
                'item'      => $Detail['id']
            ));
            $return['data']['list'][$i]['stock'] = $STOCK;
            $ALL_STOCK += $STOCK;
            //=> / END : Get Stock

            $i++;
        }

        if (!$is_detail && $add_item) {
            $return['data']['list'][$i] = array(
                'i' => 0
            );
        }
    }
    //=> / END : Extract Detail

    /**
     * Get Quotation Status
     */
    if ($Data['finish'] == 1) {
        $Q_PQ = $DB->Query(
            $Table['pq'],
            array(
                'id'
            ),
            "
                WHERE
                    pr = '" . $Data['id'] . "'
                    AND is_void != 1
            "
        );
        $R_PQ = $DB->Row($Q_PQ);
        $return['data']['quoted'] = 0;
        if ($R_PQ > 0) {
            $return['data']['quoted'] = 1;
        }
    }
    //=> / END : Get Quotation Status

    /**
     * Total Estimated
     */
    // $Apvd = Apvd($Data['id']);
    $return['data']['apvd'] = 1;
    //=> / END : Total Estimated
}
//=> / END : Get Data

echo Core::ReturnData($return);

?>