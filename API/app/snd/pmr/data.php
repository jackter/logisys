<?php
$Modid = 29;

Perm::Check($Modid, 'view');

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

$return['permissions'] = Perm::Extract($Modid);

$Table = array(
    'def'       => 'mr',
    'pr'        => 'pr',
    'item'      => 'item'
);

//=> Clean Data
if(empty($limit)){
    $limit = 10;
}
if(empty($offset)){
    $offset = 0;
}

/**
 * Filter
 */
$CLAUSE = "
    WHERE 
        approved = 1 AND 
        finish = 0
";

$PermCompany = Core::GetState('company');
if($PermCompany != "X"){
    $CLAUSE .= " AND company IN (" . $PermCompany . ")";
}

$PermDept = Core::GetState('dept');
if($PermDept != "X"){
    $CLAUSE .= " AND dept IN (" . $PermDept . ")";
}

$PermUsers = Core::GetState('users');
if($PermUsers != "X"){
    if(!empty($PermUsers)){
        $CLAUSE .= " AND create_by IN (" . $PermUsers . ")";
    }else{
        $CLAUSE .= " AND create_by = '" . Core::GetState('id') . "'";
    }
}
//=> / END : Filter

/**
 * Filter Table
 */
$ftable = json_decode($ftable, true);
if(isset($ftable)){
    foreach($ftable AS $Key => $Val){

        /**
         * Generate Clause
         */
        switch($Key){

            case "status_data":
                if(count($Val['values']) > 0){
                    for($i = 0; $i < count($Val['values']); $i++){
                        if($i == 0){
                            $CLAUSE .= "AND ( ";
                        }

                        switch($Val['values'][$i]){
                            case "UNPROCESSED":
                                if($i == 0){
                                    $CLAUSE .="processed = 0 ";
                                }else{
                                    $CLAUSE .="OR processed = 0 ";
                                }
                            break;
                            case "PROCESSED":
                                if($i == 0){
                                    $CLAUSE .="processed = 1 AND id NOT IN (SELECT mr FROM pr WHERE is_void = 0)";
                                }else{
                                    $CLAUSE .="OR processed = 1 AND id NOT IN (SELECT mr FROM pr WHERE is_void = 0)";
                                }
                            break;
                            case "PURCHASED":
                                if($i == 0){
                                    $CLAUSE .="processed = 1 AND id IN (SELECT mr FROM pr WHERE is_void = 0)";
                                }else{
                                    $CLAUSE .="OR processed = 1 AND id IN (SELECT mr FROM pr WHERE is_void = 0)";
                                }
                            break;
                        }
                        
                        if($i == count($Val['values'])-1){
                            $CLAUSE .= ")";
                        }
                    }
                }
            
                break;

            case "item_keyword":
                
                /**
                 * Search Item
                 */
                $Q_Item = $DB->Query(
                    $Table['item'],
                    array(
                        'id'
                    ),
                    "
                        WHERE
                            kode LIKE '%" . $Val['filter'] . "%' OR
                            nama LIKE '%" . $Val['filter'] . "%'
                        LIMIT 100
                    "
                );
                $R_Item = $DB->Row($Q_Item);
                if($R_Item > 0){
                    $AllItem = [];
                    while($Item = $DB->Result($Q_Item)){

                        $AllItem[] = $Item['id'];

                    }

                    /**
                     * Select MR Detail
                     * 
                     * where item id in $AllItem
                     */
                    $Q_MR_Detail = $DB->Query(
                        $Table['def'] . "_detail",
                        array(
                            'header'
                        ),
                        "
                            WHERE
                                item IN (" . implode(",", $AllItem) . ")
                        "
                    );
                    $R_MR_Detail = $DB->Row($Q_MR_Detail);
                    if($R_MR_Detail > 0){
                        $AllMR = [];
                        while($MR_Detail = $DB->Result($Q_MR_Detail)){

                            if(!in_array($MR_Detail['header'], $AllMR)){
                                $AllMR[] = $MR_Detail['header'];
                            }

                        }

                        $CLAUSE .= "
                            AND 
                                id IN (" . implode(",", $AllMR) . ")
                        ";
                    }else{
                        $CLAUSE .= "
                            AND id = ''
                        ";
                    }
                    //=> / END : Select MR Detail
                }else{
                    $CLAUSE .= "
                        AND id = ''
                    ";
                }
                //=> / END : Item

                break;

            default:
                $CLAUSE .= "
                    AND 
                        $Key LIKE '%" . $Val['filter'] . "%'                    
                ";
        }
        //=> / END : Generate Clause
    }
}
//=> / END : Filter Table

$return['clause'] = CLEANHTML($CLAUSE);

/**
 * Listing Data
 */
$return['start']        = 0;
$return['limit']        = $limit;
$return['count']        = 0;

$Q_Data = $DB->Query(
    $Table['def'],
    array('id'),
    $CLAUSE
);
$R_Data = $DB->Row($Q_Data);

if($R_Data > 0){

    $return['start']        = $start;
    $return['limit']        = $limit;
    $return['count']        = $R_Data;

    $Q_Data = $DB->Query(
        $Table['def'],
        array(
            'id',
            'company_abbr',
            'date_target',
            'kode',
            'note',
            'verified',
            'approved',
            'processed',
            'create_by',
            'create_date',
            'approved_by'
        ),
        $CLAUSE . 
        "
            ORDER BY
                create_date DESC
            LIMIT 
                $offset, $limit
        "
    );

    $i = 0;
    while($Data = $DB->Result($Q_Data)){

        $return['data'][$i] = $Data;

        $return['data'][$i]['note'] = str_replace('\n', ' ', $Data['note']);
        
        $return['data'][$i]['create_by'] = Core::GetUser('nama', $Data['create_by']);
        $return['data'][$i]['approved_by'] = Core::GetUser('nama', $Data['approved_by']);

        $return['data'][$i]['request_date'] = date('d/m/Y', strtotime($Data['create_date']));
        
        if($Data['date_target'] != '0000-00-00'){
            $return['data'][$i]['date_target'] = date('d/m/Y', strtotime($Data['date_target']));
        }

        /**
         * Get Purchased Status
         */
        $Q_PR = $DB->Query(
            $Table['pr'],
            array(
                'id'
            ),
            "
                WHERE
                    mr = '" . $Data['id'] . "' AND
                    is_void = 0
            "
        );
        $R_PR = $DB->Row($Q_PR);
        $return['data'][$i]['purchased'] = "0";
        if($R_PR > 0){
            $return['data'][$i]['purchased'] = "1";
        }
        //=> / END : Get Purchased Status

        $i++;
    }

}else{

}
//=> / END : Listing Data

echo Core::ReturnData($return);
?>