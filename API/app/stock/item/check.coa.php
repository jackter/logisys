<?php
$Modid = 24;

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

/**
 * Clean Variables
 */
$list = json_decode($list, true);
$listID = [];
foreach ($list as $key => $value) {
    $listID[] = $value['grup'];
}
//=> / END : Clean Variables

/**
 * Check COA
 */
$Q_Check = $DB->Query(
    'item_grup_coa',
    array(
        'item_grup_id'
    ),
    "
        WHERE
            company = '" . $company . "' AND 
            item_grup_id IN (" . implode(",", $listID) . ")
    "
);
$R_Check = $DB->Row($Q_Check);
$ExistID = [];
if($R_Check > 0){
    while($Check = $DB->Result($Q_Check)){
        $ExistID[] = $Check['item_grup_id'];
    }
}
//=> / END : Check COA

$AttentionItem = [];
foreach($list as $key_list => $val_list){
    
    $Exist = false;
    if(sizeof($ExistID) > 0){
        foreach ($ExistID as $key_exist => $val_exist) {
            if($val_exist == $val_list['grup']){
                $Exist = true;
                break;
            }
        }
    }

    if(!$Exist){
        $AttentionItem[] = $val_list;
    }

}

// print_r($AttentionItem);

// $ReadyToContinue = false;
if(sizeof($AttentionItem) > 0){
    $return['items'] = $AttentionItem;
}else{
    $return['status'] = 1;
}

echo Core::ReturnData($return);
?>