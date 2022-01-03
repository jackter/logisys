
<?php
$Modid = 52;

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
    'def'       => 'ast',
    'type'      => 'ast_type'
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
$CLAUSE = $CLAUSE2 = "";

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
            case "status_data":
                if(count($Val['values']) > 0){
                    for($i = 0; $i < count($Val['values']); $i++){
                        if($i == 0){
                            $CLAUSE .= "AND ( ";
                        }

                        switch($Val['values'][$i]){
                            case "DRAFT":
                                if($i == 0){
                                    $CLAUSE .="verified != 1 ";
                                }else{
                                    $CLAUSE .="OR verified != 1 ";
                                }
                            break;
                            case "VERIFIED":
                                if($i == 0){
                                    $CLAUSE .="verified = 1 ";
                                }else{
                                    $CLAUSE .="OR verified = 1 ";
                                }
                            break;
                        }
                        
                        if($i == count($Val['values'])-1){
                            $CLAUSE .= ")";
                        }
                    }
                }
            break;
            case "asset_usage":
                $CLAUSE .= "
                    AND (('WBS' LIKE '%" . $Val['filter'] . "%' AND asset_usage = 1) OR ('Fixed Asset' LIKE '%" . $Val['filter'] . "%' AND asset_usage = 0))
                ";
            break;
            case "depreciation_method":
                $CLAUSE .= "
                    AND (('Stright Line Method' LIKE '%" . $Val['filter'] . "%' AND depreciation_method = 1) OR ('Non Depreciable' LIKE '%" . $Val['filter'] . "%' AND depreciation_method = 0))
                ";
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
    array('id')
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
            'tanggal',
            'IFNULL(asset_usage, 0)' => 'asset_usage',
            'asset_type_nama',
            'depreciation_method',
            'kode',
            'acquisition_value',
            'create_date',
            'verified',
            'history',
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

        if($Data['asset_usage'] == 1){
            $return['data'][$i]['asset_usage'] = 'WBS';
        }
        else{
            $return['data'][$i]['asset_usage'] = 'Fixed Asset';
        }

        if($Data['depreciation_method'] == 1){
            $return['data'][$i]['depreciation_method'] = 'Stright Line Method';
        }
        else{
            $return['data'][$i]['depreciation_method'] = 'Non Depreciable';
        }

        /**
         * Last History
         */
        $History = json_decode($Data['history'], true);
        $History = $History[0];
        $FormatHistory = $History['description'] ." - ". datetime_db_en($History['time']);

        $User = Core::GetUser("nama", $History['user']);
        if(!empty($User)){
            $FormatHistory .= " - By " . $User;
        }

        $return['data'][$i]['history'] = $FormatHistory;
        // +> End Last History

        $i++;
    }

}

$Q_Data = $DB->Query(
    $Table['type'],
    array(
        'id',
        'company',
        'company_abbr',
        'company_nama',
        'initial_code',
        'nama',
        'depreciation_method',
        'est_year'
    ),
    "WHERE status = 1" . 
    "
        ORDER BY
            create_date DESC
        LIMIT 
            $offset, $limit
    "
);

$i = 0;
while($Data = $DB->Result($Q_Data)){
    $return['data_type'][$i] = $Data;
    $i++;
}
//=> / END : Listing Data

echo Core::ReturnData($return);
?>