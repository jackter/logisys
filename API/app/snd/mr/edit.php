<?php
$Modid = 28;

Perm::Check($Modid, 'edit');

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

$list = json_decode($list, true);

$Table = array(
    'def'       => 'mr',
    'detail'    => 'mr_detail',
    'item'      => 'item'
);

/**
 * Field
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
	'table'			=> $Table['def'],
	'clause'		=> "WHERE id = '" . $id . "'",
	'action'		=> "edit",
	'description'	=> "Edit MR"
);
$History = Core::History($HistoryField);
$Field = array(
    'date_target'   => $date_target_send,
    'note'          => $note,
    'update_by'		=> Core::GetState('id'),
	'update_date'	=> $Date,
	'history'		=> $History
);
//=> / END : Field

$DB->ManualCommit();

/**
 * Update Data
 */
if($DB->Update(
    $Table['def'],
    $Field,
    "id = '" . $id . "' AND verified = 0"
)){

    /**
     * Delete Detail Before Insert New
     */
    $DB->Delete(
        $Table['detail'],
        "header = '" . $id . "'"
    );
    //=> / END : Delete Detail Before Insert New

    /**
     * Insert Detail
     */
    for($i = 0; $i < sizeof($list); $i++){
        if(!empty($list[$i]['id'])){

            $FieldDetail = array(
                'header'            => $id,
                'item'              => $list[$i]['id'],
                'qty'               => $list[$i]['qty'],
                'cost_center'       => $list[$i]['cost_center'],
                'cost_center_kode'  => $list[$i]['cost_center_kode'],
                'cost_center_nama'  => $list[$i]['cost_center_nama'],
                'stock'             => $list[$i]['stock'],
                'coa'               => $list[$i]['coa'],
                'coa_kode'          => $list[$i]['coa_kode'],
                'coa_nama'          => $list[$i]['coa_nama'],
                'remarks'           => $list[$i]['remarks']
            );

            $return['detail'][$i] = $FieldDetail;

            if($DB->Insert(
                $Table['detail'],
                $FieldDetail
            )){
                $return['status_detail'][$i]= array(
                    'index'     => $i,
                    'status'    => 1,
                );

                /**
                 * Inject Company to Item
                 */
                $Q_Item = $DB->Query(
                    $Table['item'],
                    array(
                        'id'
                    ),
                    "
                        WHERE
                            CONCAT(',', company, ',') LIKE '%," . $company . ",%' AND 
                            id = '" .  $list[$i]['id'] . "'
                    "
                );
                $R_Item = $DB->Row($Q_Item);
                if($R_Item <= 0){
                    $Item = $DB->Result($DB->Query(
                        $Table['item'],
                        array(
                            'company'
                        ),
                        "
                            WHERE
                                id = '" .  $list[$i]['id'] . "'
                        "
                    ));

                    if(!empty($Item['company'])){
                        $ItemCompany = $Item['company'] . "," . $company;
                    }else{
                        $ItemCompany = $company;
                    }

                    $NormalizeCompany = explode(",", $ItemCompany);
                    sort($NormalizeCompany);
                    $ItemCompany = $Comma = "";
                    for($x = 0; $x < sizeof($NormalizeCompany); $x++){
                        $ItemCompany .= $Comma . $NormalizeCompany[$x];
                        $Comma = ",";
                    }

                    $DB->Update(
                        $Table['item'],
                        array(
                            'company'   => $ItemCompany
                        ),
                        "id = '" . $list[$i]['id'] . "'"
                    );
                }
                //=> / END : Inject Company to Item

            }else{
                $return['status_detail'][$i] = array(
                    'index'     => $i,
                    'status'    => 0,
                    'error_msg' => $GLOBALS['mysql']->error
                );
            }

        }
    }
    //=> / END : Insert Detail

    $DB->Commit();

    $return['status'] = 1;
}else{
    $return = array(
        'status'    => 0,
        'error_msg' => $GLOBALS['mysql']->error
    );
}
//=> / END : Update Data

echo Core::ReturnData($return);
?>