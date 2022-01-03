<?php
$Modid = 130;

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
    'def'       => 'mti',
    'detail'    => 'mti_detail',
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
        id != ''
";
$PermCompany = Core::GetState('company');
if($PermCompany != "X"){
    $CLAUSE .= " AND company IN (" . $PermCompany . ")";
}

$PermDept = Core::GetState('dept');
if($PermDept != "X" && !empty($PermDept)){
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
                            case "UNVERIFIED":
                                if($i == 0){
                                    $CLAUSE .="verified = 0";
                                }else{
                                    $CLAUSE .="OR verified = 0";
                                }
                            break;
                            case "VERIFIED":
                                if($i == 0){
                                    $CLAUSE .="verified = 1 AND approved = 0";
                                }else{
                                    $CLAUSE .="OR verified = 1 AND approved = 0";
                                }
                            break;
                            case "FINISH":
                                if($i == 0){
                                    $CLAUSE .="verified = 1 AND approved = 1";
                                }else{
                                    $CLAUSE .="OR verified = 1 AND approved = 1";
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
                if($Q_Item > 0){
                    $AllItem = [];
                    while($Item = $DB->Result($Q_Item)){

                        $AllItem[] = $Item['id'];
                    }

                    /**
                     * Select MR Detail
                     * 
                     * where item id in $Allitem
                     */

                    $Q_MR_Detail = $DB->Query(
                        $Table['def'] . "_detail",
                        array(
                            'header'
                        ),
                        "
                            WHERE
                                item IN (" . implode(",", $AllItem) .")
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
                                id IN (".implode(",", $AllMR) .")
                        ";
                    }else{
                        $CLAUSE .= "
                            AND id = ''
                        ";
                    }

                    // >> end L select MR Detail
                }else{
                    $CLAUSE .= "
                        AND id  = ''
                    ";
                }

                break;
                // >> end : search item

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
            'from_storeloc_kode',
            'to_storeloc_kode',
            'mto_kode',
            'kode',
            'tanggal',
            'remarks',
            'verified',
            'approved',
            'create_by',
            'create_date'
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

        $return['data'][$i]['remarks'] = str_replace('\n', ' ', $Data['remarks']);
        $return['data'][$i]['create_by'] = Core::GetUser('nama', $Data['create_by']);

        $i++;
    }

}
//=> / END : Listing Data

echo Core::ReturnData($return);
?>