<?php
$Modid = 179;
Perm::Check($Modid, 'hapus');

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
    'def'           => 'kontrak_invoice',
    'detail'        => 'kontrak_invoice_detail',
    'detail_progress'    => 'kontrak_progress_detail'
);

$DB->ManualCommit();

$Q_Data = $DB->Query(
    $Table['detail'],
    array(
        'detail_progress'
    ),
    "WHERE 
        header = '". $id ."'"
);
$R_Data = $DB->Row($Q_Data);

if ($R_Data > 0) {
    while ($Data = $DB->Result($Q_Data)) {
        $FieldsDetail = array(
            'invoice'       => 0,
            'invoice_by'    => null,
            'invoice_date'  => null
        );

        if ($DB->Update(
            $Table['detail_progress'],
            $FieldsDetail,
            "id = '" . $Data['detail_progress'] . "' "
        )) {
            $return['status_detail_progress'][$i] = array(
                'index' => $i,
                'status' => 1
            );
        }
    }
}

if($DB->Delete(
    $Table['detail'],
    "header = '" . $id . "'"
)){
    if(
        $DB->Delete(
            $Table['def'],
            "
                id = '" . $id . "'
            "
    )){
        $DB->Commit();
        $return['status'] = 1;
    }
}else{
    $return = array(
        'status'        => 0,
        'error_msg'     => "Cannot Delete Contract Invoice"
    );
}

echo Core::ReturnData($return);
?>