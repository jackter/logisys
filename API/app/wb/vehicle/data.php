<?php
$Modid = 79;

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
    'def'       => 'wb_vehicle'
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
";
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
            case "nama":

                $CLAUSE .= "
                    AND (
                        T.nama LIKE '%" . $Val['filter'] . "%'
                    )
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

$Q_Data = $DB->QueryPort("
    SELECT
        V.id
    FROM
        wb_transporter T,
        wb_vehicle V
    WHERE
        V.transporter = T.id
        $CLAUSE
");
$R_Data = $DB->Row($Q_Data);

if($R_Data > 0){

    $return['start']        = $start;
    $return['limit']        = $limit;
    $return['count']        = $R_Data;

    $Q_Data = $DB->QueryPort("

        SELECT
            V.id,
            V.nopol,
            V.transporter,
            T.nama
        FROM
            wb_transporter T,
            wb_vehicle V
        WHERE
            V.transporter = T.id
            $CLAUSE
        LIMIT
            $offset, $limit
    ");

    $i = 0;
    while($Data = $DB->Result($Q_Data)){

        $return['data'][$i] = $Data;

        $i++;
    }

}else{

}
//=> / END : Listing Data

echo Core::ReturnData($return);
?>