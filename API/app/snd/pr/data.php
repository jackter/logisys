<?php
$Modid = 30;

Perm::Check($Modid, 'view');

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

$return['permissions'] = Perm::Extract($Modid);

$Table = array(
    'def'       => 'pr',
    'detail'    => 'pr_detail',
    'pq'        => 'pq',
    'pq_sup_rep'        => 'pq_supplier_reply',
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

// $PermUsers = Core::GetState('users');
// if($PermUsers != "X"){
//     if(!empty($PermUsers)){
//         $CLAUSE .= " AND create_by IN (" . $PermUsers . ")";
//     }else{
//         $CLAUSE .= " AND create_by = '" . Core::GetState('id') . "'";
//     }
// }
//=> / END : Filter

/**
 * Show By Permissions
 */
if(Core::GetState('id') != 1){
    if(Perm::Check2($Modid, 'only_verified')){
        $CLAUSE .= "
            AND verified = 1
        ";
    }
    if(Perm::Check2($Modid, 'only_approved')){
        $CLAUSE .= "
            AND approved = 1
        ";
    }
    if(Perm::Check2($Modid, 'only_approved2')){
        $CLAUSE .= "
            AND approved2 = 1
        ";
    }
}
//=> / END : Show By Permissions

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
                            case "DRAFT":
                                if($i == 0){
                                    $CLAUSE .="verified != 1 AND is_void != 1 AND is_close != 1";
                                }else{
                                    $CLAUSE .="OR verified != 1 AND is_void != 1 AND is_close != 1";
                                }
                            break;
                            case "VERIFIED":
                                if($i == 0){
                                    $CLAUSE .="verified = 1 AND approved != 1";
                                }else{
                                    $CLAUSE .="OR verified = 1 AND approved != 1";
                                }
                            break;
                            case "MANAGER APPROVED":
                                if($i == 0){
                                    $CLAUSE .="verified = 1 AND approved = 1 AND finish != 1";
                                }else{
                                    $CLAUSE .="OR verified = 1 AND approved = 1 AND finish != 1";
                                }
                            break;
                            case "DIRKOM APPROVED":
                                if($i == 0){
                                    $CLAUSE .="approved2 = 1 AND finish != 1";
                                }else{
                                    $CLAUSE .="OR approved2 = 1 AND finish != 1";
                                }
                            break;
                            case "CEO APPROVED":
                                if($i == 0){
                                    $CLAUSE .="approved3 = 1 AND finish != 1";
                                }else{
                                    $CLAUSE .="OR approved3 = 1 AND finish != 1";
                                }
                            break;
                            case "FINISH":
                                if($i == 0){
                                    $CLAUSE .="finish = 1 AND id IN (SELECT pr FROM pq WHERE is_void != 1)";
                                }else{
                                    $CLAUSE .="OR finish = 1 AND id IN (SELECT pr FROM pq WHERE is_void != 1)";
                                }
                            break;
                            case "FINISH, READY TO CREATE QUOTATION":
                                if($i == 0){
                                    $CLAUSE .="finish = 1 AND is_void != 1 AND is_close != 1 AND id NOT IN (SELECT pr FROM pq WHERE is_void != 1)";
                                }else{
                                    $CLAUSE .="OR finish = 1 AND is_void != 1 AND is_close != 1 AND id NOT IN (SELECT pr FROM pq WHERE is_void != 1)";
                                }
                            break;
                            case "CANCELED":
                                if($i == 0){
                                    $CLAUSE .="is_void = 1 ";
                                }else{
                                    $CLAUSE .="OR is_void = 1 ";
                                }
                            break;
                            case "CLOSED":
                                if($i == 0){
                                    $CLAUSE .="is_close = 1 ";
                                }else{
                                    $CLAUSE .="OR is_close = 1 ";
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
                     * Select PR Detail
                     * 
                     * where item id in AllItem
                     */
                    $Q_PR_Detail = $DB->Query(
                        $Table['def'] . "_detail",
                        array(
                            'header'
                        ),
                        "
                            WHERE
                                item IN (" . implode(",", $AllItem) . ")
                        "
                    );
                    $R_PR_Detail = $DB->Row($Q_PR_Detail);
                    if($R_PR_Detail > 0){
                        $AllPR = [];
                        while($PR_Detail = $DB->Result($Q_PR_Detail)){

                            if(!in_array($PR_Detail['header'], $AllPR)){
                                $AllPR[] = $PR_Detail['header'];
                            }
                        }

                        $CLAUSE .= "
                            AND 
                                id IN (" . implode(",", $AllPR) . ")
                        ";
                    }else{
                        $CLAUSE .= "
                            AND id = ''
                        ";
                    }
                    //=> END : Select PR Detail
                }else{
                    $CLAUSE .= "
                        AND id = ''
                    ";
                }
                //=> END : Search Item

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
            'dept_abbr',
            'tanggal',
            'kode',
            'mr',
            'mr_kode',
            'verified',
            'approved',     //MGR
            'approved_by',
            'approved2',    //DIRKOM / HEAD
            'approved2_by',
            'approved3',    //CEO
            'approved3_by',
            'create_by',
            'create_date',
            'finish',
            'finish_date',
            'is_void',
            'is_close',
            'close_remarks',
            'note',
            'history'
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

        $return['data'][$i]['pr_date'] = date('d/m/Y', strtotime($Data['create_date']));

        $return['data'][$i]['create_by'] = Core::GetUser('nama', $Data['create_by']);

        /**
         * Approved By
         */
        $ApprovedBy = "WAITING";
        if($Data['verified'] != 1){
            $ApprovedBy = "DRAFT";
        }
        if($Data['approved_by'] > 0){
            $ApprovedBy = Core::GetUser('nama', $Data['approved_by']);
        }
        if($Data['approved2_by'] > 0){
            $ApprovedBy = Core::GetUser('nama', $Data['approved2_by']);
        }
        if($Data['approved3_by'] > 0){
            $ApprovedBy = Core::GetUser('nama', $Data['approved3_by']);
        }
        $return['data'][$i]['approved_by'] = $ApprovedBy;
        //=> / END : Approved By
        
        if($Data['tanggal'] != '0000-00-00'){
            $return['data'][$i]['tanggal'] = date('d/m/Y', strtotime($Data['tanggal']));
        }

        /**
         * Total Estimated
         */
        // $Apvd = Apvd($Data['id']);  
        $return['data'][$i]['apvd'] = 1;
        //=> / END : Total Estimated

        /**
         * Last History
         */
        $History = json_decode($Data['history'], true);
        $History = $History[0];
        $FormatHistory = $History['description'] . " - " . datetime_db_en($History['time']);

        $User = Core::GetUser("nama", $History['user']);
        if(!empty($User)){
            $FormatHistory .= " - By " . $User;
        }

        $return['data'][$i]['history'] = $FormatHistory;
        //=> / END : Last History

        /**
         * Get Quotation Status
         */
        if($Data['finish'] == 1){
            $Q_PQ = $DB->Query(
                $Table['pq'],
                array(
                    'id'
                ),
                "
                    WHERE
                        pr = '" . $Data['id'] . "'
                        AND is_void != 1
                "
            );
            $R_PQ = $DB->Row($Q_PQ);
            $return['data'][$i]['quoted'] = 0;
            if($R_PQ > 0){
                $Data_PQ = $DB->Result($Q_PQ);
                $return['data'][$i]['quoted'] = 1;

                $Q_PQ_SR = $DB->Query(
                    $Table['pq_sup_rep'],
                    array(
                        'id'
                    ),
                    "
                        WHERE
                            header = '" . $Data_PQ['id'] . "'
                    "
                );
                $R_PQ_SR = $DB->Row($Q_PQ_SR);
                $return['data'][$i]['sup_replay'] = 0;
                if($R_PQ_SR > 0){
                    $return['data'][$i]['sup_replay'] = 1;
                }
            }
        }
        //=> / END : Get Quotation Status

        $i++;
    }

}else{

}
//=> / END : Listing Data

echo Core::ReturnData($return);
?>