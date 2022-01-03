<?php

$Modid = 51;

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
    'def'       => 'ast',
    'detail'    => 'ast_detail',
    'depre'     => 'ast_depreciation'
);

$DB->ManualCommit();

if($DB->Delete(
    $Table['detail'],
    "header = '" . $id . "'"
)){
    /**
     * Delete Detail
     */
    if($DB->Delete(
        $Table['def'],
        "id = '" . $id . "'"
    )){
        if($DB->Delete(
            $Table['depre'],
            "
                header = '".$id."'
            "
        )){
            $DB->Commit();
            $return['status'] = 1;
        }
    }
     // => End Delete Detail  

}else{
    $return = array(
        'status'        => 0,
        'error_msg'     => "Cannot Delete Processed"
    );
}

echo Core::ReturnData($return);
?>