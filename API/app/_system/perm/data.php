<?php
$Modid = 12;

Perm::Check($Modid, 'view');

//=> Default Statement
$return = [];
$RPL	= "";
$SENT   = Core::Extract($_POST, $RPL);

//=> Extract Array
if(isset($SENT)){
    foreach($SENT as $KEY => $VAL){	
        $$KEY = $VAL;
    }
}

$return['permissions'] = Perm::Extract($Modid);

//=> Clean Data
if(empty($limit)){
	$limit = 10;
}
if(empty($offset)){
	$offset = 0;
}

$start = $offset * $limit;

$Config = array(
	'table'			=> 'sys_group',
	'limit'			=> $limit,
	'start'			=> $start
);

/************************************/
//=> Filter Data
$CLAUSE = "WHERE id != '' AND STATUS = 1 ";
if(!empty($fq)){
	$CLAUSE .= "
		AND 
		(
			nama LIKE '%" . $fq . "%' OR
			keterangan LIKE '%" . $fq . "%'
		)
	";
}
//=> END Filter Data
/************************************/

$return['start']	= 0;
$return['limit']	= 0;
$return['count']	= 0;

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

/**
 * Extract Data
 */

$Q_Data = $DB->Query(
    $Config['table'],
    array('id'),
    $CLAUSE
);
$R_Data = $DB->Row($Q_Data);
if($R_Data > 0){

    $return['start']	= $start;
	$return['limit']	= $limit;
    $return['count']	= $R_Data;

    $Q_Data = $DB->Query(
        $Config['table'],
        array(
            'id',
            'nama',
            'keterangan',
            'status'
        ),
        $CLAUSE
    );
    
    $no = $start;

    $i = 0;
    while($Data = DB_RESULT($Q_Data)){
		$no++;
		
        $return['data'][$i] = $Data;
        
        $return['data'][$i]['no'] = $no;
		
		$i++;
	}


}
//=> / END : Extract Data

echo Core::ReturnData($return);
?>