<?php
$Modid = 31;

include "_function.php";

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
    'def'       => 'pq',
    'supplier'  => 'pq_supplier',
    'send'      => 'pq_supplier_quotesend',
    'reply'     => 'pq_supplier_reply',
    'pr'        => 'pr',
    'detail'    => 'pr_detail',
    'po'        => 'po'
);

$DB->ManualCommit();

if(!empty($detail_id)){
    if($DB->Update(
        $Table['supplier'],
        array(
            'is_print' => $is_print
        ),
        "id = '" . $detail_id . "'"
    )){

        $DB->Commit();

        $return['status'] = 1;
    }else{
        $return['status'] = 0;
    }
}else{
    $return['status'] = 0;
}

echo Core::ReturnData($return);
?>