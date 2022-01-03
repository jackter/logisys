<?php
$Modid = 42;

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
    'def'       => 'supplier'
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
            case "cp_all":

                $CLAUSE .= "
                    AND (
                        cp_telp1 LIKE '%" . $Val['filter'] . "%' OR
                        cp_telp2 LIKE '%" . $Val['filter'] . "%' OR
                        cp_hp1 LIKE '%" . $Val['filter'] . "%' OR
                        cp_hp2 LIKE '%" . $Val['filter'] . "%'
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
            'kode',
            'nama',
            'tipe_nama',
            'alamat',
            'kabkota',
            'provinsi',
            'country_nama',
            'cp',
            'cp_telp1',
            'cp_telp2',
            'cp_hp1',
            'cp_hp2',
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

        $CP = "";
        $Comma = "";
        if($Data['cp_telp1']){
            $CP .= $Comma . $Data['cp_telp1'];
            $Comma = " / ";
        }
        if($Data['cp_telp2']){
            $CP .= $Comma . $Data['cp_telp2'];
            $Comma = " / ";
        }
        if($Data['cp_hp1']){
            $CP .= $Comma . $Data['cp_hp1'];
            $Comma = " / ";
        }
        if($Data['cp_hp2']){
            $CP .= $Comma . $Data['cp_hp2'];
            $Comma = " / ";
        }

        $return['data'][$i]['cp_all'] = $CP;

        $i++;
    }

}else{

}
//=> / END : Listing Data

echo Core::ReturnData($return);
?>