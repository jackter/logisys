<?php
$Modid = 132;

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
    'def'   =>  'activity_location_control'
);

/**
 * History
 */
$HistoryField = array(
    'table'         => $Table['def'],
    'action'        => "edit",
    'description'   => "Edit Activity Location Control"
);
$History = Core::History($HistoryField);
//=> END : History

$Date = date('Y-m-d H:i:s');

$Q_Item = $DB->Query(
    $Table['def'],
    array(
        'id'      
    ),
    "
    WHERE 
        company = '" . $company . "' 
        AND doc_id = '" . $doc_id . "' 
        AND coa = '" . $coa . "'
    "
);
$R_Item = $DB->Row($Q_Item);
if($R_Item == 0){
    /*Update Data*/
    if($DB->Update(
        $Table['def'],
        array(
            'coa'           => $coa,
            'coa_kode'      => $coa_kode,
            'coa_nama'      => $coa_nama,
            'update_by'     => Core::GetState('id'),
            'update_date'   => $Date,
            'history'       => $History
        ),
        "id = '" . $id . "'"
    )){

        $return['status'] = 1;

    }
    else{
        $return = array(
            'status'        => 0,
            'error_msg'     => 'Gagal Mengedit Data'
        );
    }
}
else{
    $return['status'] = 1;
}

echo Core::ReturnData($return);

?>