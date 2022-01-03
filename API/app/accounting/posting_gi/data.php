<?php
$Modid = 50;

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
    'def'       => 'gi',
    'item'      => 'item'
);

//=> Clean Data
if(empty($limit)){
    $limit = 10;
}
if(empty($offset)){
    $offset = 0;
}

if($pending == true){
    $pending = 0;
}else{
    $pending = 1;
}

if($finish == false){
    $finish = 3;
}else{
    $finish = 1;
}

/**
 * Filter
 */
$CLAUSE = "
    WHERE 
        jurnal IN (".$pending.",". $finish .")
        AND gi.status = 1
";
$PermCompany = Core::GetState('company');
if($PermCompany != "X"){
    $CLAUSE .= " AND gi.company IN (" . $PermCompany . ")";
}

$PermDept = Core::GetState('dept');
if($PermDept != "X" && !empty($PermDept)){
    $CLAUSE .= " AND gi.dept IN (" . $PermDept . ")";
}

$PermUsers = Core::GetState('users');
if($PermUsers != "X"){
    if(!empty($PermUsers)){
        $CLAUSE .= " AND gi.create_by IN (" . $PermUsers . ")";
    }else{
        $CLAUSE .= " AND gi.create_by = '" . Core::GetState('id') . "'";
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
                                gi.id IN (" . implode(",", $AllGI) . ")
                        ";
                    }else{
                        $CLAUSE .= "
                            AND gi.id = ''
                        ";
                    }
                    //=> END : Select GI Detail
                }else{
                    $CLAUSE .= "
                        AND gi.id = ''
                    ";
                }
                //=> END : Search Item

                break;

            default:
                $CLAUSE .= "
                    AND 
                        gi.$Key LIKE '%" . $Val['filter'] . "%'                    
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

// $Q_Data = $DB->Query(
//     $Table['def'],
//     array('id'),
//     $CLAUSE
// );
$Q_Data = $DB->QueryPort("
    SELECT
        gi.id
    FROM
        gi,
        gi_detail gid,
        item i 
        $CLAUSE
        AND gi.id = gid.header 
        AND gid.item = i.id 
        AND i.item_type IN ( 0, 1 )
    GROUP BY gi.id
    ORDER BY
            gi.create_date DESC
");
$R_Data = $DB->Row($Q_Data);

if($R_Data > 0){

    $return['start']        = $start;
    $return['limit']        = $limit;
    $return['count']        = $R_Data;

    $Q_Data = $DB->QueryPort("
        SELECT
            gi.id,
            gi.company,
            gi.company_abbr,
            gi.dept_abbr,
            gi.cost_center,
            gi.cost_center_kode,
            gi.cost_center_nama,
            gi.tanggal,
            gi.kode,
            gi.mr_kode,
            gi.create_date,
            gi.history,
            gi.jurnal 
        FROM
            gi,
            gi_detail gid,
            item i 
            $CLAUSE
            AND gi.id = gid.header 
            AND gid.item = i.id
            AND i.item_type = 1
        GROUP BY gi.id
        ORDER BY
                gi.create_date DESC
            LIMIT 
                $offset, $limit
    ");

    $i = 0;
    while($Data = $DB->Result($Q_Data)){

        $return['data'][$i] = $Data;

        /**
         * Last Hostory
         */
        $History = json_decode($Data['history'], true);
        $History = $History[0];
        $FormatHistory = $History['description'] . " - " . datetime_db_en($History['time']);
       
        $User = Core::GetUser("nama", $History['user']);
        if(!empty($User)){
            $FormatHistory .= " - By ". $User;
        }

        $return['data'][$i]['history'] = $FormatHistory;
        // => End Last History

        $i++;
    }

}
//=> / END : Listing Data

echo Core::ReturnData($return);
?>