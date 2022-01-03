<?php
$Modid = 25;

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
    'def'       => 'storeloc'
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
if($PermCompany == "X"){
    $CLAUSE .= "";
}else{
    $CLAUSE .= " AND company IN (" . $PermCompany . ")";
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
            case 'sounding':
                $CLAUSE .= "
                    AND (('Yes' LIKE '%" . $Val['filter'] . "%' AND sounding = 1) OR ('No' LIKE '%" . $Val['filter'] . "%' AND sounding = 0))
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
            'kode',
            'nama',
            'sounding'
        ),
        $CLAUSE . 
        "
            ORDER BY
                kode ASC
            LIMIT 
                $offset, $limit
        "
    );

    $i = 0;
    while($Data = $DB->Result($Q_Data)){

        $return['data'][$i] = $Data;

        if($Data['sounding'] == '1'){
            $return['data'][$i]['sounding'] = 'Yes';
        }
        else{
            $return['data'][$i]['sounding'] = 'No';
        }

        $i++;
    }

}else{

}
//=> / END : Listing Data

echo Core::ReturnData($return);
?>