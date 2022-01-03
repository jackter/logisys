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
    'def'       => 'mr'
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
    $SearchKey = [];
    $SearchKeywords = $SearchComma = "";
    $SearchScore = [];

    $i = 1;
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
            default:
                $SearchKeywords = $SearchComma . $Val['filter'];
                $SearchComma = " ";
                $SearchKey[] = $Key;
                $SearchScore[] = $i;

                $i++;
        }
        //=> / END : Generate Clause

        if(sizeof($SearchKey) > 0){
            $Search = Search::Create(
                $SearchKeywords,
                $SearchKey,
                $SearchScore
            );
    
            $QSql = "," . $Search['query'];
            $QSqlClause = $Search['having'];
        }
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
    array('id' . $QSql),
    $CLAUSE . 
    $QSqlClause
);
$R_Data = $DB->Row($Q_Data);

if($R_Data > 0){

    $return['start']        = $start;
    $return['limit']        = $limit;
    $return['count']        = $R_Data;

    $ORDER = "ORDER BY create_date DESC";
    if(!empty($QSql)){
        $ORDER = "ORDER BY relevance DESC";
    }

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
            'create_date' . $QSql
        ),
        $CLAUSE . 
        $QSqlClause . 
        $ORDER . 
        "
            LIMIT 
                $offset, $limit
        "
    );

    $i = 0;
    while($Data = $DB->Result($Q_Data)){

        $return['data'][$i] = $Data;

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