<?php
$Modid = 137;

Perm::Check($Modid, 'edit');

$return = [];
$RPL = "";
$SENT = Core::Extract($_POST, $RPL);

/* Extract Array */
if(isset($SENT)){
    foreach($SENT as $KEY => $VAL){	
        $$KEY = $VAL;
    }
}

$Table = array(
    'def'   => 'vehicle_master'
);

/**
 * History
 */
$HistoryField = array(
    'table'         => $Table['def'],
    'action'        => "add",
    'description'   => "Edit Vehicle"
);
$History = Core::History($HistoryField);
//=> END : History

$Date = date('Y-m-d H:i:s');

/*Update Data*/
if($DB->Update(
    $Table['def'],
    array(
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
        'update_by'             => Core::GetState('id'),
        'update_date'           => $Date,
        'history'               => $History
    ),
    "id = '" . $id . "'"
)){

    $return['status'] = 1;

}else{
    $return = array(
        'status'        => 0,
        'error_msg'     => 'Gagal Mengedit Data'
    );
}

echo Core::ReturnData($return);

?>