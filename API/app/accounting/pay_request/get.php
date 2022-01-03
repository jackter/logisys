<?php
$Modid = 63;

Perm::Check($Modid, 'view');

//=> Default Statement
$return = [];
$RPL	= "";
$SENT	= Core::Extract($_POST, $RPL);

//=> Extract Array
if(isset($SENT)){
    foreach($SENT as $KEY => $VAL){	
        $$KEY = $VAL;
    }
}

/*Check Special Logo for Print*/
// $ShowLogo = array(
//     'CKA',
//     'AMJ',
//     'ENM',
//     'MP',
//     'IJI',
// );

$Table = array(
    'def'       => 'sp3',
    'detail'    => 'sp3_detail'
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
        'dept',
        'dept_abbr',
        'dept_nama',
        'cost_center' => 'cost_center_id',
        'cost_center_kode',
        'cost_center_nama',
        'tanggal',
        'kode',
        'po',
        'pay_req_type',
        'tipe_pihak_ketiga',
        'po_no' => 'po_kode',
        'po_tgl' => 'tanggal_po',
        'penerima',
        'penerima_nama',
        'currency',
        'total' => 'GrandTotal',
        'keterangan_bayar' => 'payment_note',
        'verified',
        'approved',
        'status'
    ),
    "
        WHERE id = '" . $id . "'
    "
);
$R_Data = $DB->Row($Q_Data);
if($R_Data > 0){
    $Data = $DB->Result($Q_Data);

    // if(in_array($Data['company_abbr'], $ShowLogo)){
    //     $Data['show_logo'] = 1;
    // }

    $return['data'] = $Data;
    $return['data']['supplier'] = $Data['penerima'];
    $return['data']['supplier_nama'] = $Data['penerima_nama'];

    /**
     * Detail Payment Request
     */
    $Q_Detail = $DB->QueryPort("
        SELECT
            id,
            kode,
            tipe,
            amount,
            grn_id
        FROM
            invoice 
        WHERE
            sp3 = " . $id . "
    ");
    $R_Detail = $DB->Row($Q_Detail);

    if($R_Detail > 0){
        $i = 0;
        while($Detail = $DB->Result($Q_Detail)){

            $return['data']['detail'][$i] = $Detail;
            $return['data']['tipe'] = $Detail['tipe'];
            $i++;

        }
    }
    // => End Detail Payment Request

    /**
     * Detail Payment Request
     */
    $Q_Detail2 = $DB->Query(
        $Table['detail'],
        array(
            'id'        => 'id_detail',
            'uraian',
            'jumlah'
        ),
        "
            WHERE
                header = '".$id."'
        "
    );
    $R_Detail2 = $DB->Row($Q_Detail2);

    $i = 0;
    if($R_Detail2 > 0){
        $i = 0;
        while($Detail2 = $DB->Result($Q_Detail2)){

            $return['data']['detail2'][$i] = $Detail2;
            $i++;

        }
    }
    // => End Detail Payment Request

}
//=> / END : Get Data

echo Core::ReturnData($return);
?>