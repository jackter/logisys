<?php
$Modid = 69;

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

$Table = array(
    'def'       => 'bl'
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
//=> / END : Filter

$PermCompany = Core::GetState('company');
if($PermCompany != "X"){
    $CLAUSE .= " AND company IN (" . $PermCompany . ")";
}

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
            'tanggal',
            'kode',
            'kontrak_kode',
            'so_kode',
            'item_nama',
            'create_date',
            'verified',
            'approved',
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

        $i++;
    }
}

echo Core::ReturnData($return);
?>