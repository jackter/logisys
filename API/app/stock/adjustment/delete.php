<?php

$Modid = 66;

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
    'def'       => 'stock_adjustment',
    'detail'    => 'stock_adjustment_detail'
);

$DB->ManualCommit();

if($DB->Delete(
    $Table['detail'],
    "
        header = '" . $id . "'
    "
)){
    /**
     * Delete Detail
     */
    if($DB->Delete(
        $Table['def'],
        "
            id = '".$id."'
        "
    )){

        $DB->Commit();
        $return['status'] = 1;
        
    }
     // => End Delete Detail  

}else{
    $return = array(
        'status'        => 0,
        'error_msg'     => "Cannot Delete Processed JO"
    );
}

echo Core::ReturnData($return);
?>