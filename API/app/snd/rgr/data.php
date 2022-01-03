<?php
$Modid = 43;

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
    'def'       => 'rgr',
    'detail'    => 'rgr_detail',
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
        status = 1
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
                     * Select RGR Detail
                     * 
                     */
                    $Q_RGR_Detail = $DB->Query(
                        $Table['def'] . "_detail",
                        array(
                            'header'
                        ),
                        "
                            WHERE
                                item IN (" . implode(",", $AllItem) . ")
                        "
                    );
                    $R_RGR_Detail = $DB->Row($Q_RGR_Detail);
                    if($R_RGR_Detail > 0){
                        $AllRGR = [];
                        while($RGR_Detail = $DB->Result($Q_RGR_Detail)){

                            if(!in_array($RGR_Detail['header'], $AllRGR)){
                                $AllRGR[] = $RGR_Detail['header'];
                            }
                        }

                        $CLAUSE .= "
                            AND 
                                id IN (" . implode(",", $AllRGR) . ")
                        ";
                    }else{
                        $CLAUSE .= "
                            AND id = ''
                        ";
                    }
                    //=> END : Select RGR Detail
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
            'kode',   
            'gr',
            'gr_kode',
            'po',
            'po_kode',
            'tanggal',
            'supplier_nama',
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
        
        if($Data['tanggal'] != '0000-00-00'){
            $return['data'][$i]['tanggal'] = date('d/m/Y', strtotime($Data['tanggal']));
        }

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