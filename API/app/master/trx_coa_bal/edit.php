<?php
$Modid = 111;

Perm::Check($Modid, 'edit');

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
    'def'   => 'trx_coa_balance'
);

/**
 * Field
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
	'table'			=> $Table['def'],
	'clause'		=> "WHERE id = '" . $id . "'",
	'action'		=> "edit",
	'description'	=> "Edit Trx COA Balance"
);
$History = Core::History($HistoryField);

$Q_Data = $DB->Query(
    $Table['def'],
    array(
        'id'
    ),
    "WHERE company = '".$company."'
    AND doc_id = '".$doc_id."'
    AND seq = '".$seq."'"
);

$R_Data = $DB->Row($Q_Data);

if ($R_Data == 0) {
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
        'update_by'		=> Core::GetState('id'),
        'update_date'	=> $Date,
        'history'		=> $History
    );
    //=> / END : Field

    /**
     * Insert Data
     */
    if($DB->Update(
        $Table['def'],
        $Field,
        "
            id = '" . $id . "'
        "
    )){
        $return['status'] = 1;
    }else{
        $return = array(
            'status'    => 0,
            'error_msg' => $GLOBALS['mysql']->error
        );
    }
    //>> End: Insert Data
}else{
    $return = array(
        'status'    => 0,
        'error_msg' => $GLOBALS['mysql']->error
    );
}
//>> End: Insert Data

echo Core::ReturnData($return);
?>