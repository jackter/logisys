<?php

$Modid = 25;
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
    'def'           => 'storeloc',
    'kategori'      => 'storeloc_kategori'
);

/**
 * Create Code
 */
if (empty($kategori_kode)) {
    $Q_Kategori = $DB->Query(
        $Table['kategori'],
        array(
            'kode',
        ),
        "
            WHERE
                id = '" . $kategori . "'
        "
    );
    $R_Kategori = $DB->Row($Q_Kategori);
    if ($R_Kategori > 0) {
        $Kategori = $DB->Result($Q_Kategori);
        $kategori_kode = $Kategori['kode'];
    }
}

$InitialCode = $company_abbr . "-" . strtoupper($kategori_kode);
$Len = 3;
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

/**
 * Field
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
    'table'            => $Table['def'],
    'clause'        => "WHERE kode = '" . $kode . "'",
    'action'        => "add",
    'description'    => "Added new Store Location (" . $kode . ")"
);
$History = Core::History($HistoryField);
$Field = array(
    'company'       => $company,
    'company_abbr'  => $company_abbr,
    'company_nama'  => $company_nama,
    'kategori'      => $kategori,
    'sounding'      => $sounding,
    'produk'        => $product,
    'kapasitas'     => $kapasitas,
    'meja_ukur'     => $meja_ukur,
    'suhu'          => $suhu,
    'kode'          => $kode,
    'nama'          => $nama,
    'declaration'   => $declaration,
    'create_by'        => Core::GetState('id'),
    'create_date'    => $Date,
    'history'        => $History,
    'status'        => 1
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
    $DB->Commit();

    $return['status'] = 1;
} else {
    $return = array(
        'status'    => 0,
        'error_msg' => $GLOBALS['mysql']->error
    );
}
//=> / END : Insert Data

echo Core::ReturnData($return);

?>