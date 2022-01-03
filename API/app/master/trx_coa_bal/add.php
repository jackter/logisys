<?php
$Modid = 111;

Perm::Check($Modid, 'add');

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

$Table = array(
    'def'       => 'trx_coa_balance'
);

$Date = date("Y-m-d H:i:s");

$HistoryField = array(
	'table'			=> $Table['def'],
	'clause'		=> "WHERE id = '" . $id . "'",
	'action'		=> "add",
	'description'	=> "Create COA"
);
$History = Core::History($HistoryField);

$Q_Data = $DB->Query(
    $Table['def'],
    array(
        'id'
    ),
    "WHERE company = '".$company."'
    AND doc_id = '".$doc_id."'
    AND coa = '".$coa."'"
);

$R_Data = $DB->Row($Q_Data);

if ($R_Data == 0) {
    /**
     * Field
     */
    $Field = array(
        'company'       => $company,
        'company_abbr'  => $company_abbr,
        'company_nama'  => $company_nama,
        'coa'           => $coa,
        'coa_kode'      => $coa_kode,
        'coa_nama'      => $coa_nama,
        'doc_id'        => $doc_id,
        'doc_nama'      => $doc_nama,
        'doc_source'    => $doc_source,
        'keterangan'    => $remarks,
        'seq'           => $seq,
        'create_by'     => Core::GetState('id'),
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
    }
    else{
        $return = array(
            'status'    => 0,
            'error_msg' => $GLOBALS['mysql']->error
        );
    }
}
else{
    $return = array(
        'status'    => 0,
        'error_msg' => $GLOBALS['mysql']->error
    );
}
//>> End: Insert Data

echo Core::ReturnData($return);
?>