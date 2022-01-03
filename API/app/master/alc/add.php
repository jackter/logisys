<?php
$Modid = 132;

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
    'def'   =>  'activity_location_control'
);

/**
 * History
 */
$HistoryField = array(
    'table'         => $Table['def'],
    'action'        => "add",
    'description'   => "Add New Activity Location Control"
);
$History = Core::History($HistoryField);
//=> END : History

$Date = date('Y-m-d H:i:s');

$Fields = array(
    'company'       => $company,
    'company_abbr'  => $company_abbr,
    'company_nama'  => $company_nama,
    'doc_id'        => $doc_id,
    'doc_nama'      => $doc_nama,
    'doc_source'    => $doc_source,
    'coa'           => $coa,
    'coa_kode'      => $coa_kode,
    'coa_nama'      => $coa_nama,
    'create_by'     => Core::GetState('id'),
    'create_date'	=> $Date,
    'history'		=> $History,
    'status'        => 1
);

/*Insert Data*/
if($DB->Delete(
    $Table['def'],
    "company = '" . $company . "' AND doc_id = '" . $doc_id . "' AND coa = '" . $coa . "'"
)){
    if($DB->Insert(
        $Table['def'],
        $Fields
    )){
        $return['status'] = 1;
    }
}else{
    $return = array(
        'status'    => 0,
        'error_msg' => 'Gagal Menyimpan Data'
    );
}

echo Core::ReturnData($return);

?>