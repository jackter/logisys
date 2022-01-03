<?php
$Modid = 137;

Perm::Check($Modid, 'add');

/* Default Statement */
$return = [];
$RPL = "";
$SENT = Core::Extract($_POST, $RPL);

/* Extract Array */
if (isset($SENT)) {
    foreach ( $SENT as $KEY => $VAL) {
        $$KEY = $VAL;
    }
}

$Table = array(
    'def' => 'vehicle_master'
);

/**
 * Create Code
 */
$InitialCode = strtoupper($vgrup_abbr) . "-" . strtoupper($company_abbr) . "-";
$Len = 4;
$LastKode = $DB->Result($DB->Query(
    $Table['def'],
    array('kode'),
    "
        WHERE
            kode LIKE '" . $InitialCode . "%' 
        ORDER BY 
            REPLACE(kode, '" . $InitialCode . "', '') DESC
    "
));
$LastKode = (int) substr($LastKode['kode'], -$Len) + 1;
$LastKode = str_pad($LastKode, $Len, 0, STR_PAD_LEFT);

$kode = $InitialCode . $LastKode;
//=> END : Create Code

/**
 * History
 */
$HistoryField = array(
    'table'         => $Table['def'],
    'action'        => "add",
    'description'   => "Add New Vehicle"
);
$History = Core::History($HistoryField);
//=> END : History

$Date = date('Y-m-d H:i:s');

$Fields = array(
    'kode'                  => $kode,
    'company'               => $company,
    'company_abbr'          => $company_abbr,
    'company_nama'          => $company_nama,
    'vgrup'                 => $vgrup,
    'vgrup_abbr'            => $vgrup_abbr,
    'vgrup_nama'            => $vgrup_nama,
    'nopol'                 => $nopol,
    'tahun_pembuatan'       => $tahun_pembuatan,
    'tahun_pemakaian'       => $tahun_pemakaian,
    'model'                 => $model,
    'no_mesin'              => $no_mesin,
    'no_chasis'             => $no_chasis,
    'no_kir'                => $no_kir,
    'permissions'           => $permissions,
    'keterangan'            => $keterangan,
    'create_by'             => Core::GetState('id'),
    'create_date'           => $Date,
    'history'               => $History,
    'status'                => 1
);

/*Insert Data*/
if($DB->Insert(
    $Table['def'],
    $Fields
)){
    $return['status'] = 1;
}else{
    $return = array(
        'status'    => 0,
        'error_msg' => 'Gagal Menyimpan Data'
    );
}

echo Core::ReturnData($return);

?>