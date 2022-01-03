<?php
$Modid = 71;

Perm::Check($Modid, 'add');

//=> Default Statement
$return = [];
$RPL	= "";
$SENT   = Core::Extract($_POST, $RPL);

//=> Extract Array
if(isset($SENT)){
    foreach($SENT as $KEY => $VAL){	
        $$KEY = $VAL;
    }
}

$Table = array(
    'def'           => 'customer',
);

/**
 * Create Code
 */ 
$InitialCode = 'CTM';
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
$LastKode = (int)substr($LastKode['kode'], -$Len) + 1;
$LastKode = str_pad($LastKode, $Len, 0, STR_PAD_LEFT);

$kode = $InitialCode . $LastKode;
//=> / END : Create Code

$Q_Abbr = $DB->Query(
    $Table['def'],
    array(
        'abbr'
    ),
    "
        WHERE abbr = '" . $abbr . "'
    "
);

$R_Abbr = $DB->Row($Q_Abbr);
if($R_Abbr > 0){
    $abbr = strtoupper(App::Abbr($nama, 4));
}

/**
 * Field
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
	'table'			=> $Table['def'],
	'clause'		=> "WHERE kode = '" . $kode . "'",
	'action'		=> "add",
	'description'	=> "Added new Customer Data"
);
$History = Core::History($HistoryField);
$Field = array(
    'kode'          => $kode,
    'nama'          => $nama,
    'jenis'         => $jenis,
    'abbr'          => $abbr,
    'alamat'        => $alamat,
    'kabkota'       => $kabkota,
    'provinsi'      => $provinsi,
    'cp'            => $cp,
    'cp_telp1'      => $cp_telp1,
    'cp_telp2'      => $cp_telp2,
    'cp_hp1'        => $cp_hp1,
    'cp_hp2'        => $cp_hp2,
    'country'       => 104,
    'country_kode'  => 'ID',
    'country_nama'  => 'Indonesia',
    'keterangan'    => $keterangan,
    'create_by'		=> Core::GetState('id'),
	'create_date'	=> $Date,
	'history'		=> $History,
    'status'        => 1
);
//=> / END : Field

/**
 * Insert Data
 */
if($DB->Insert(
    $Table['def'],
    $Field
)){
    $return['status'] = 1;
}else{
    $return = array(
        'status'    => 0,
        'error_msg' => $GLOBALS['mysql']->error
    );
}
//=> / END : Insert Data

echo Core::ReturnData($return);
?>