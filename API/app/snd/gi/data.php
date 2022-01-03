<?php
$Modid = 36;

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
    'detail'    => 'mr_detail',
    'gi'        => 'gi',
    'gid'       => 'gid',
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
        processed = 1 AND 
        ref_type != 3
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
            case "verified":

                if(!empty($Val['values'])){
                    $SEPARATOR = "";
                    $CLAUSE .= "AND (";
                    foreach($Val['values'] AS $Item){

                        if(strtolower($Item) == "verified"){
                            $CLAUSE .= "
                                $SEPARATOR verified = 1 AND approved = 0
                            ";
                        }

                        if(strtolower($Item) == "unverified"){
                            $CLAUSE .= "
                                $SEPARATOR verified = 0
                            ";
                        }

                        if(strtolower($Item) == "approved"){
                            $CLAUSE .= "
                                $SEPARATOR approved = 1
                            ";
                        }
                        $SEPARATOR = "OR";

                    }
                    $CLAUSE .= ")";
                }else{
                    $CLAUSE .= "
                        AND 
                            verified = 2
                    ";
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
                     * Select GI Detail
                     * 
                     * where item id in AllItem
                     */
                    $Q_GI_Detail = $DB->Query(
                        $Table['def'] . "_detail",
                        array(
                            'header'
                        ),
                        "
                            WHERE
                                item IN (" . implode(",", $AllItem) . ")
                        "
                    );
                    $R_GI_Detail = $DB->Row($Q_GI_Detail);
                    if($R_GI_Detail > 0){
                        $AllGI = [];
                        while($GI_Detail = $DB->Result($Q_GI_Detail)){

                            if(!in_array($GI_Detail['header'], $AllGI)){
                                $AllGI[] = $GI_Detail['header'];
                            }
                        }

                        $CLAUSE .= "
                            AND 
                                id IN (" . implode(",", $AllGI) . ")
                        ";
                    }else{
                        $CLAUSE .= "
                            AND id = ''
                        ";
                    }
                    //=> END : Select GI Detail
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
            'DATE_FORMAT(create_date, "%Y-%m-%d")' => 'tanggal',
            'kode',
            'create_date',
            'finish',
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

        $return['data'][$i]['po_date'] = date('d/m/Y', strtotime($Data['create_date']));
        
        if($Data['tanggal'] != '0000-00-00'){
            $return['data'][$i]['tanggal'] = date('d/m/Y', strtotime($Data['tanggal']));
        }

        /**
         * Finish Percent
         */
        $AllMR = $DB->Result($DB->QueryPort("
            SELECT
                SUM(D.qty_approved) AS qty
            FROM
                " . $Table['def'] . " AS H,
                " . $Table['detail'] . " AS D
            WHERE
                H.id = '" . $Data['id'] . "' AND 
                D.header = H.id
        "));
        $AllMR = $AllMR['qty'];

        $Q_GI = $DB->Query(
            $Table['gi'],
            array('id'),
            "
                WHERE
                    mr = '" . $Data['id'] . "'
            "
        );
        $R_GI = $DB->Row($Q_GI);
        $AllGI = 0;
        if($R_GI > 0){
            while($GI = $DB->Result($Q_GI)){

                $DGI = $DB->Result($DB->QueryPort("
                    SELECT
                        SUM(D.qty_gi) - SUM(D.qty_return) AS qty
                    FROM
                        gi AS H,
                        gi_detail AS D
                    WHERE
                        H.id = '" . $GI['id'] . "' AND 
                        D.header = H.id
                "));
                $AllGI += $DGI['qty'];
            }
        }

        $FinishPercent = 0;

        if($AllGI > 0){
            $FinishPercent = ($AllGI / $AllMR) * 100;
        }
        $return['data'][$i]['finish_percent'] = $FinishPercent;
        //=> / END : Finish Percent

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

        $i++;
    }

}
//=> / END : Listing Data

echo Core::ReturnData($return);
?>