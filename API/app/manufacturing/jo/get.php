<?php

$Modid = 60;
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

/**
 * Check Special Logo for Print
 */
$ShowLogo = array(
    'CKA',
    'AMJ',
    'ENM',
    'MP',
    'IJI',
    'BSG',
    'NSP'
);

$Table = array(
    'def'       => 'jo',
    'detail'    => 'jo_detail',
    'item'      => 'item'
);

/**
 * Get Data
 */
$Q_Data = $DB->Query(
    $Table['def'],
    array(
        'id',
        'kode',
        'tanggal',
        'item',
        'company',
        'company_abbr',
        'company_nama',
        'start_date',
        'end_date',
        'description',
        'storeloc',
        'kontrak_kode',
        'storeloc_kode',
        'storeloc_nama',
        'plant',
        'inforder',
        'order_tipe',
        'bom',
        'bom_kode',
        'shift_rate',
        'running_hours',
        'man_power',
        'verified',
        'approved',
        'create_by',
        'create_date',
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

    $Item = $DB->Result($DB->Query(
        $Table['item'],
        array(
            'kode',
            'nama2' => 'nama',
            'satuan'
        ),
        "
            WHERE
                id = '" . $Data['item'] . "'
        "
    ));
    $return['data']['item_kode'] = $Item['kode'];
    $return['data']['nama_produk'] = $Item['nama'];
    $return['data']['satuan'] = $Item['satuan'];

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

    if(!empty($Data['approved_by'])){
        $return['data']['approved_by'] = Core::GetUser("nama", $Data['approved_by']);
        $return['data']['approved_date'] = date("d/m/Y H:i:s", strtotime($Data['approved_date'])) . " WIB";
    }
    /**
     * Extract Detail
     */
    $Q_Detail = $DB->QueryPort("
        SELECT
            D.item AS id,
            D.ref_qty,
            D.qty,
            TRIM(I.nama) AS nama,
            I.satuan,
            D.tipe,
            I.kode
        FROM
            item AS I,
            " . $Table['detail'] . " AS D
        WHERE
            D.header = '" . $id . "' AND
            D.item = I.id
        ORDER BY
            tipe ASC
    ");
    $R_Detail = $DB->Row($Q_Detail);
    if ($R_Detail > 0) {
        $im = 0;
        $io = 0;
        $iu = 0;

        while ($Detail = $DB->Result($Q_Detail)) {

            if ($Detail['tipe'] == 1) {
                $return['data']['material'][$im] = $Detail;
                $im++;
            } elseif ($Detail['tipe'] == 2) {
                $return['data']['output'][$io] = $Detail;
                $io++;
            } elseif ($Detail['tipe'] == 3) {
                $return['data']['utility'][$iu] = $Detail;
                $iu++;
            }
        }

        if (!$is_detail) {
            $return['data']['material'][$im] = array(
                'i' => 0
            );
            $return['data']['output'][$io] = array(
                'i' => 0
            );
            $return['data']['utility'][$iu] = array(
                'i' => 0
            );
        }
    }
    //=> / END : Extract Detail

}
//=> / END : Get Data

echo Core::ReturnData($return);
