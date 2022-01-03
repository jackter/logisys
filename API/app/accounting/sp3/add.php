<?php

$Modid = 109;
Perm::Check($Modid, 'add');

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
    'def' => 'sp3'
);

$Date = date('Y-m-d H:i:s');

$LIST = json_decode($list, true);

#Create History
$HistoryField = array(
    'table'         => $Table['def'],
    'clause'        => "WHERE id = '" . $id . "'",
    'action'        => "add",
    'description'   => "Add New SP3"
);
$History = Core::History($HistoryField);

# Create Kode
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

$KODE = $InitialCode . $LastKode;

# Fields
$Fields = array(
    'tanggal'           => $tanggal_send,
    'company'           => $company,
    'company_abbr'      => $company_abbr,
    'company_nama'      => $company_nama,
    'kode'              => $KODE,
    'grup'              => $grup,
    'grup_nama'         => $grup_nama,
    'po_no'             => $po_no,
    'po_tgl'            => $tanggal_po,
    'penerima'          => $penerima,
    'penerima_nama'     => $penerima_nama,
    'cost_center'       => $cost,
    'cost_center_kode'  => $cost_kode,
    'cost_center_nama'  => $cost_nama,
    'currency'          => $currency,
    'total'             => $total,
    'keterangan_bayar'  => $keterangan_bayar,
    'is_manual'         => 1,
    'create_by'         => Core::GetState('id'),
    'create_date'       => $Date,
    'history'           => $History,
    'status'            => 1
);

$Field2 = array(
    'company'           => $company,
    'company_abbr'      => $company_abbr,
    'company_nama'      => $company_nama,
    'cost_center'       => $cost,
    'cost_center_kode'  => $cost_kode,
    'cost_center_nama'  => $cost_nama,
    'grup'              => $grup,
    'grup_nama'         => $grup_nama,
    'tanggal'           => $tanggal_send,
    'kode'              => $KODE,
    'po_no'             => $po_no,
    'po_tgl'            => $tanggal_po,
    'penerima'          => $penerima,
    'penerima_nama'     => $penerima_nama,
    'currency'          => $currency,
    'total'             => $total,
    'keterangan_bayar'  => $keterangan_bayar,
    'create_by'         => 20000 + Core::GetState('id'),
    'create_date'       => $Date,
    'history'           => $History,
    'status'            => 1
);

$DB->ManualCommit();

# Insert
if ($DB->Insert(
    $Table['def'],
    $Fields
)) {
    $return['status'] = 1;

    $Header = $DB->Result($DB->Query(
        $Table['def'],
        array('id'),
        "
            WHERE
                create_by = '" . Core::GetState('id') . "' AND 
                create_date = '" . $Date . "' AND 
                kode = '" . $KODE . "'
            LIMIT 1
        "
    ));

    for ($i = 0; $i < sizeof($LIST); $i++) {
        if (
            !empty($LIST[$i]['uraian']) &&
            !empty($LIST[$i]['jumlah'])
        ) {
            $DetailFields = array(
                'header'    => $Header['id'],
                'uraian'    => $LIST[$i]['uraian'],
                'jumlah'    => $LIST[$i]['jumlah']
            );
            $DB->Insert(
                $Table['def'] . "_detail",
                $DetailFields
            );
        }
    }

    if ($DB->InsertOn(
        DB['recon'],
        $Table['def'],
        $Field2
    )) {
        $P3 = $DB->Result($DB->QueryOn(
            DB['recon'],
            $Table['def'],
            array(
                'id'
            ),
            "
                WHERE
                    kode = '" . $KODE . "'
            "
        ));

        # Insert Detail
        for ($i = 0; $i < sizeof($LIST); $i++) {
            if (
                !empty($LIST[$i]['uraian']) &&
                !empty($LIST[$i]['jumlah'])
            ) {
                $DetailFields = array(
                    'header'    => $P3['id'],
                    'uraian'    => $LIST[$i]['uraian'],
                    'jumlah'    => $LIST[$i]['jumlah']
                );
                $DB->InsertOn(
                    DB['recon'],
                    $Table['def'] . "_detail",
                    $DetailFields
                );
            }
        }

        $DB->Commit();
        $return['status'] = 1;
    }
} else {
    $return = array(
        'status' => 0,
        'error_msg' => 'Gagal Menyimpan Data'
    );
}

echo Core::ReturnData($return);

?>