<?php
$Modid = 28;

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
                            case "UNVERIFIED":
                                if($i == 0){
                                    $CLAUSE .="verified = 0 AND finish = 0";
                                }else{
                                    $CLAUSE .="OR verified = 0 AND finish = 0";
                                }
                            break;
                            case "VERIFIED":
                                if($i == 0){
                                    $CLAUSE .="verified = 1 AND approved = 0 AND finish = 0";
                                }else{
                                    $CLAUSE .="OR verified = 1 AND approved = 0 AND finish = 0";
                                }
                            break;
                            case "APPROVED":
                                if($i == 0){
                                    $CLAUSE .="verified = 1 AND approved = 1 AND finish = 0";
                                }else{
                                    $CLAUSE .="OR verified = 1 AND approved = 1 AND finish = 0";
                                }
                            break;
                            case "FINISH":
                                if($i == 0){
                                    $CLAUSE .="finish = 1";
                                }else{
                                    $CLAUSE .="OR finish = 1";
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

if(
    $is_mobile == 1 && 
    isset($keyword) && 
    !empty($keyword)
){

    $keyword = str_replace(" ", "%", $keyword);

    $CLAUSE .= "
        AND (
            kode LIKE '%" . $keyword . "%' OR 
            note LIKE '%" . $keyword . "%'
        )
    ";

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
                kode LIKE '%" . $keyword . "%' OR
                nama LIKE '%" . $keyword . "%'
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
        if(count($AllItem) > 0){
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
                    OR
                        id IN (".implode(",", $AllMR) .")
                ";
            }

        }

        // >> end L select MR Detail
    }

    $return['clause'] = $CLAUSE;

}

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

    $return['start']        = $offset;
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
            'validated',
            'finish',
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

        $return['data'][$i]['note'] = str_replace('\n', ' ', $Data['note']);
        $return['data'][$i]['create_by'] = Core::GetUser('nama', $Data['create_by']);

        $return['data'][$i]['request_date'] = date('d/m/Y', strtotime($Data['create_date']));
        
        if($Data['date_target'] != '0000-00-00'){
            $return['data'][$i]['date_target'] = date('d/m/Y', strtotime($Data['date_target']));
        }

        $i++;
    }

}else{

}
//=> / END : Listing Data

echo Core::ReturnData($return);
?>