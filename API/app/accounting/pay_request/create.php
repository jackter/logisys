<?php

$Modid = 63;
Perm::Check($Modid, 'add');

//=> Default Statement
$return = [];
$RPL    = "";
$SENT   = Core::Extract($_POST, $RPL);

//=> Extract Array
if (isset($SENT)) {
    foreach ($SENT as $KEY => $VAL) {
        $$KEY = $VAL;
    }
}

$Table = array(
    'def'       => 'sp3',
    'detail'    => 'sp3_detail',
    'inv'       => 'invoice',
    'pcr'       => 'rekap_pcr'
);

/**
 * get company & group
 */
$Q_Company = $DB->QueryOn(
    DB['master'],
    "company",
    array(
        'id',
        'nama',
        'abbr',
        'grup'
    ),
    "
    WHERE 
        id = '" . $company . "'
    "
);
$R_Company = $DB->Row($Q_Company);
if ($R_Company > 0) {
    $Company = $DB->Result($Q_Company);
}

$Q_Grup = $DB->QueryOn(
    DB['master'],
    "company_grup",
    array(
        'nama'
    ),
    "
        WHERE
            id = '" . $Company['grup'] . "'
    "
);
$R_Grup = $DB->Row($Q_Grup);
if ($R_Grup > 0) {
    $Grup = $DB->Result($Q_Grup);
}
// => end get company & group

$list = json_decode($list_send, true);
$list_inv = json_decode($list_inv, true);

/**
 * Create Code
 */
$Time = date('y') . "/";
$Time2 = romawi(date('n')) . "/";
$InitialCode = "P3/" . strtoupper($company_abbr) . "/" . $Time . $Time2;
$InitialCodeCheck = "P3/" . strtoupper($company_abbr) . "%/" . $Time;

$Len = 4;
$LastKode = $DB->Result($DB->Query(
    $Table['def'],
    array('kode'),
    "
        WHERE
            kode LIKE '" . $InitialCode . "%' 
        ORDER BY 
            SUBSTR(kode, -$Len, $Len) DESC
        "
));
$LastKode = (int) substr($LastKode['kode'], -$Len) + 1;
$LastKode = str_pad($LastKode, $Len, 0, STR_PAD_LEFT);

$kode = $InitialCode . $LastKode;
//=> / END : Create Code

/**
 * Field
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
    'table'         => $Table['def'],
    'clause'        => "WHERE id = '" . $id . "'",
    'action'        => "add",
    'description'   => "Create SP3"
);
$History = Core::History($HistoryField);

if($pay_req_type == 2){
    $supplier = $penerima;
    $supplier_nama = $penerima_nama;
}

$Field = array(
    'company'           => $company,
    'company_abbr'      => $company_abbr,
    'company_nama'      => $company_nama,
    'dept'              => $dept,
    'dept_abbr'         => $dept_abbr,
    'dept_nama'         => $dept_nama,
    'cost_center'       => $cost_center_id,
    'cost_center_kode'  => $cost_center_kode,
    'cost_center_nama'  => $cost_center_nama,
    'grup'              => $Company['grup'],
    'grup_nama'         => $Grup['nama'],
    'tanggal'           => $tanggal,
    'kode'              => $kode,
    'po'                => $po,
    'pay_req_type'      => $pay_req_type,
    'tipe_pihak_ketiga' => $tipe_pihak_ketiga,
    'po_no'             => $po_kode,
    'po_tgl'            => $tanggal_po,
    'penerima'          => $supplier,
    'penerima_nama'     => $supplier_nama,
    'currency'          => $currency,
    'total'             => $GrandTotal,
    'keterangan_bayar'  => $payment_note,
    'create_by'         => Core::GetState('id'),
    'create_date'       => $Date,
    'history'           => $History,
    'status'            => 1
);

$Supplier = $DB->Result($DB->QueryOn(
    DB['recon'],
    "pengirim_penerima",
    array(
        'id'
    ),
    "
        WHERE
            nama = '" . $supplier_nama . "'
        LIMIT 1
    "
));

if (empty($Supplier)) {
    $supplier = 0;
} else {
    $supplier = $Supplier['id'];
}

$Field2 = array(
    'company'           => $company,
    'company_abbr'      => $company_abbr,
    'company_nama'      => $company_nama,
    'cost_center'       => $cost_center_id,
    'cost_center_kode'  => $cost_center_kode,
    'cost_center_nama'  => $cost_center_nama,
    'grup'              => $Company['grup'],
    'grup_nama'         => $Grup['nama'],
    'tanggal'           => $tanggal,
    'kode'              => $kode,
    'po_no'             => $po_kode,
    'po_tgl'            => $tanggal_po,
    'penerima'          => $supplier,
    'penerima_nama'     => $supplier_nama,
    'currency'          => $currency,
    'total'             => $GrandTotal,
    'keterangan_bayar'  => $payment_note,
    'create_by'         => 20000 + Core::GetState('id'),
    'create_date'       => $Date,
    'history'           => $History,
    'status'            => 1
);
//=> / END : Field

$DB->ManualCommit();

/**
 * Insert Data
 */
if ($DB->Insert(
    $Table['def'],
    $Field
)) {
    $P3 = $DB->Result($DB->Query(
        $Table['def'],
        array(
            'id'
        ),
        "
            WHERE
                kode = '" . $kode . "' AND
                create_date = '" . $Date . "'
        "
    ));

    /**
     * Insert Detail
     */
    for ($i = 0; $i < sizeof($list); $i++) {
        $FiledDetail = array(
            'header'    => $P3['id'],
            'uraian'    => $list[$i]['uraian'],
            'jumlah'    => $list[$i]['jumlah']
        );

        if ($DB->Insert(
            $Table['detail'],
            $FiledDetail
        )) {
            $return['status_detail'][$i] = array(
                'index'     => $i,
                'status'    => 1,
            );
        }
    }

    // => End Insert Detail

    /**
     * insert kode P3 ke Invoice
     */

    $id = "";
    for ($i = 0; $i < sizeof($list_inv); $i++) {
        if ($i == 0) {
            $id .= $list_inv[$i]['id'];
        } else {
            $id .= ", " . $list_inv[$i]['id'];
        }
    }

    if($pay_req_type == 0 || $pay_req_type == 1){
        if ($DB->Update(
            $Table['inv'],
            array(
                'sp3'       => $P3['id'],
                'sp3_kode'  => $kode
            ),
            "
                id in (" . $id . ")
            "
        ));
    }
    else if($pay_req_type == 2){
        if ($DB->Update(
            $Table['pcr'],
            array(
                'sp3'       => $P3['id'],
                'sp3_kode'  => $kode
            ),
            "
                id = " . $po . "
            "
        ));
    }

    $return['inv'] = $id;

    // => end insert kode P3 ke invoice

    if ($DB->InsertOn(
        DB['recon'],
        $Table['def'],
        $Field2
    )) {
        $return['status'] = 1;

        $P3 = $DB->Result($DB->QueryOn(
            DB['recon'],
            $Table['def'],
            array(
                'id'
            ),
            "
                WHERE
                    kode = '" . $kode . "' AND
                    create_date = '" . $Date . "'
            "
        ));

        /**
         * Insert Detail
         */
        for ($i = 0; $i < sizeof($list); $i++) {
            $FiledDetail = array(
                'header'    => $P3['id'],
                'uraian'    => $list[$i]['uraian'],
                'jumlah'    => $list[$i]['jumlah']
            );

            $DB->InsertOn(
                DB['recon'],
                $Table['detail'],
                $FiledDetail
            );
        }

        // => End Insert Detail

    }

    $DB->Commit();
    $return['status'] = 1;
} else {
    $return = array(
        'status'    => 0,
        'error_msg' => $GLOBALS['mysql']->error
    );
}
//>> End: Insert Data

echo Core::ReturnData($return);

?>